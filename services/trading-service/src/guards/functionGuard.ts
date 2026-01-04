import { Request, Response, NextFunction } from "express";
import { hitRpm } from "../analytics/redis";

export function functionGuard(req: Request, res: Response, next: NextFunction) {
  const apiKey = (req as any).apiKey as string;

  // RPM accounting (fire-and-forget)
  hitRpm(apiKey);

  next();
}
