import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export function requestId(req: Request, res: Response, next: NextFunction) {
  const rid = String(req.headers["x-request-id"] || "") || crypto.randomUUID();
  (req as any).requestId = rid;
  res.setHeader("x-request-id", rid);
  next();
}
