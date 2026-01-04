import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { Request } from "express";

export const neuronLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req: Request) => {
    return ipKeyGenerator(req.ip);
  }
});
