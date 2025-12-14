import rateLimit from "express-rate-limit";
import { Request } from "express";

export function perSymbolLimiter(opts: { windowMs: number; max: number }) {
  return rateLimit({
    windowMs: opts.windowMs,
    max: opts.max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
      const symbol =
        (req.params && (req.params as any).symbol) ||
        (req.body && (req.body as any).symbol) ||
        (req.query && (req.query as any).symbol) ||
        "unknown";

      const apiKey = req.header("x-api-key") || "anon";
      return `${apiKey}:${String(symbol).toUpperCase()}`;
    }
  });
}
