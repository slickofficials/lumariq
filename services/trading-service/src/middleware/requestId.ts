import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export function requestId(req: Request, res: Response, next: NextFunction) {
  const incoming = req.header("x-request-id");
  const id = incoming || crypto.randomUUID();
  (req as any).requestId = id;
  res.setHeader("x-request-id", id);
  next();
}
