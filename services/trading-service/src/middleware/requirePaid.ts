import type { Request, Response, NextFunction } from "express";
import { isPaid } from "../analytics/redis";

/**
 * Usage:
 *   requirePaid(redis)
 */
export function requirePaid(redis: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = String((req as any).apiKey || req.headers["x-api-key"] || "");
    if (!apiKey) {
      return res.status(401).json({ error: "API key required" });
    }

    const ok = await isPaid(redis);
    if (!ok) {
      return res.status(402).json({ error: "Payment required" });
    }

    next();
  };
}
