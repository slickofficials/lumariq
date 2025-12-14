import { Request, Response, NextFunction } from "express";

export function canary(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("x-canary");
  (req as any).isCanary = header === "1" || header === "true";
  next();
}
