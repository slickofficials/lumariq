import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { createProxyMiddleware, Options } from "http-proxy-middleware";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";

const app = express();
app.use(helmet());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(obs);
app.use(morgan("combined"));

const RATE_LIMIT_WINDOW = Number(process.env.RATE_LIMIT_WINDOW || 60) * 1000;
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 200);

app.use(
  rateLimit({
    windowMs: RATE_LIMIT_WINDOW,
    max: RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true
  })
);

// Health
app.get("/health", (_req: Request, res: Response) => {
  return res.json({ service: "api-gateway", status: "ok" });
});

// Serve OpenAPI files (from repo root /openapi)
app.get("/openapi/:name", (req: Request, res: Response) => {
  const name = req.params.name;
  const file = path.resolve(__dirname, "../../openapi", name);
  if (!fs.existsSync(file)) return res.status(404).json({ error: "not found" });
  res.sendFile(file);
});

// Simple JWT middleware
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET || "dev_access_secret");
    // attach payload if needed
    (req as any).user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Proxy helper
function proxyOptions(target: string, changeOrigin = true): Options {
  return {
    target,
    changeOrigin,
    pathRewrite: (pathStr) => pathStr, // keep full path
    onProxyReq: (proxyReq) => {
      // remove insecure headers if present
      proxyReq.removeHeader("x-forwarded-host");
    },
    logLevel: "warn"
  };
}

// Service targets (use docker service names)
const USERS = process.env.USERS_URL || "http://users-service:4001";
const KYC = process.env.KYC_URL || "http://kyc-service:4100";
const LEGAL = process.env.LEGAL_URL || "http://legal-service:4200";
const ORDERS = process.env.ORDERS_URL || "http://orders-service:4000";
const DISPATCH = process.env.DISPATCH_URL || "http://dispatch-service:8080";
const WALLET = process.env.WALLET_URL || "http://wallet-ledger:7070";

// Public proxies (no auth)
app.use("/auth", createProxyMiddleware(proxyOptions(USERS)));
app.use("/openapi", createProxyMiddleware(proxyOptions(`http://host.docker.internal:3000`))); // fallback

// Protected routes — require JWT, then proxy
app.use("/users", requireAuth, createProxyMiddleware(proxyOptions(USERS)));
app.use("/kyc", requireAuth, createProxyMiddleware(proxyOptions(KYC)));
app.use("/legal", requireAuth, createProxyMiddleware(proxyOptions(LEGAL)));
app.use("/orders", requireAuth, createProxyMiddleware(proxyOptions(ORDERS)));
app.use("/dispatch", requireAuth, createProxyMiddleware(proxyOptions(DISPATCH)));
app.use("/wallet", requireAuth, createProxyMiddleware(proxyOptions(WALLET)));

// Generic fallback
app.use((req, res) => res.status(404).json({ error: "route_not_found" }));

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("API-GATEWAY ERROR:", err);
  res.status(500).json({ error: "internal_error" });
});

// Start server
const port = Number(process.env.PORT || 3050);
app.listen(port, () => {
  console.log(`API Gateway running on :${port}`);
});