import type { Request, Response, NextFunction } from "express";

export function trustHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("x-content-type-options", "nosniff");
  res.setHeader("x-frame-options", "DENY");
  res.setHeader("referrer-policy", "no-referrer");
  next();
}
