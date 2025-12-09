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
