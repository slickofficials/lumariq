import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

export function trustHeaders(req: Request, res: Response, next: NextFunction) {
  const requestId = randomUUID();
  res.setHeader("X-Request-Id", requestId);

  const apiKey = (req as any).apiKey;
  if (apiKey?.rateLimitRpm) {
    res.setHeader("X-RateLimit-Limit", apiKey.rateLimitRpm);
  }

  next();
}
