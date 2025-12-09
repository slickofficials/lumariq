#!/usr/bin/env bash
set -euo pipefail

SERVICE_DIR="services/users-service"

echo "🔥 Hardening users-service (Phase 3: security + validation + rate limits)..."

cd "$SERVICE_DIR"

echo "📦 Installing Phase 3 dependencies..."
npm install zod express-rate-limit helmet cors
npm install -D @types/cors

mkdir -p src/middleware src/validation

echo "📚 Writing src/middleware/validate.ts..."
cat > src/middleware/validate.ts <<'TS'
import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

export const validate =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      return res.status(400).json({
        error: "validation_error",
        details: result.error.flatten(),
      });
    }

    // Use the parsed, safe values
    req.body = result.data.body;
    req.query = result.data.query as any;
    req.params = result.data.params as any;

    return next();
  };
TS

echo "📚 Writing src/validation/authSchemas.ts..."
cat > src/validation/authSchemas.ts <<'TS'
import { z } from "zod";

const emailField = z.string().email().min(6).max(255);
const passwordField = z.string().min(8).max(128);

const emptyObject = z.object({}).optional().default({});

export const registerSchema = z.object({
  body: z.object({
    email: emailField,
    password: passwordField,
  }),
  query: emptyObject,
  params: emptyObject,
});

export const loginSchema = z.object({
  body: z.object({
    email: emailField,
    password: passwordField,
  }),
  query: emptyObject,
  params: emptyObject,
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(10),
  }),
  query: emptyObject,
  params: emptyObject,
});
TS

echo "🛡️ Writing src/middleware/rateLimiter.ts..."
cat > src/middleware/rateLimiter.ts <<'TS'
import rateLimit from "express-rate-limit";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export const loginLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  max: Number(process.env.LOGIN_MAX_PER_WINDOW ?? 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "too_many_login_attempts" },
});

export const authLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  max: Number(process.env.AUTH_MAX_PER_WINDOW ?? 100),
  standardHeaders: true,
  legacyHeaders: false,
});
TS

echo "🧱 Writing src/middleware/securityHeaders.ts..."
cat > src/middleware/securityHeaders.ts <<'TS'
import helmet from "helmet";
import cors from "cors";
import type { RequestHandler } from "express";

const rawOrigins = process.env.CORS_ORIGINS ?? "";
const allowedOrigins = rawOrigins
  .split(",")
  .map((o) => o.trim())
  .filter((o) => o.length > 0);

export const helmetMiddleware: RequestHandler = helmet({
  contentSecurityPolicy: false, // API only, easier for dev
  crossOriginEmbedderPolicy: false,
});

export const corsMiddleware: RequestHandler = cors({
  origin: allowedOrigins.length ? allowedOrigins : "*",
  credentials: true,
});
TS

echo "🧭 Rewriting src/routes/auth.routes.ts with validation + rate limits..."
cat > src/routes/auth.routes.ts <<'TS'
import { Router } from "express";
import { register, login, refreshToken } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { registerSchema, loginSchema, refreshSchema } from "../validation/authSchemas";
import { authLimiter, loginLimiter } from "../middleware/rateLimiter";

const router = Router();

// Maximum security for auth endpoints
router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", loginLimiter, validate(loginSchema), login);
router.post("/refresh", authLimiter, validate(refreshSchema), refreshToken);

router.get("/health", (_req, res) => {
  res.json({ status: "users-service ok" });
});

export default router;
TS

echo "🧠 Rewriting src/app.ts to plug in security middlewares..."
cat > src/app.ts <<'TS'
import express from "express";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes";
import { corsMiddleware, helmetMiddleware } from "./middleware/securityHeaders";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

app.disable("x-powered-by");

// Core parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

// Logging chain
app.use(morgan("combined"));
app.use(requestLogger);

// Security middlewares
app.use(helmetMiddleware);
app.use(corsMiddleware);

// Routes
app.use("/auth", authRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "users-service ok" });
});

// 404 + error handler
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
TS

echo "✅ Phase 3 security files written for users-service."
echo "Next:"
echo "  cd services/users-service"
echo "  rm -rf dist"
echo "  npm run build"
echo "  npm run dev"
