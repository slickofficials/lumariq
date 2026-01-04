import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { bus } from "./eventbus/bus";
import { ledger } from "./eventbus/ledger";

const app = express();

/* -------------------------
 * GLOBAL MIDDLEWARE (B)
 * ------------------------- */
app.use(helmet());
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use((req, _res, next) => {
  (req as any).requestId = crypto.randomUUID();
  next();
});

/* -------------------------
 * ROUTES
 * ------------------------- */
registerRoutes(app);

/* -------------------------
 * EVENT BUS + LEDGER (C)
 * ------------------------- */
bus.attachLedger(ledger);

/* -------------------------
 * SERVER BOOTSTRAP (A)
 * ------------------------- */
const PORT = Number(process.env.PORT || 4010);
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`🚀 Trading-Service running on :${PORT}`);
});

/* -------------------------
 * GRACEFUL SHUTDOWN
 * ------------------------- */
const shutdown = async () => {
  console.log("🛑 Graceful shutdown initiated");
  await bus.flush?.();
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

export default app;
