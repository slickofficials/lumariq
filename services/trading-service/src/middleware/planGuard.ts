import { downgradeToFree, isPaid, getPaidUntil } from "../analytics/redis";
import { Request, Response, NextFunction } from "express";

export async function planGuard(req: Request, res: Response, next: NextFunction) {
  const apiKey = (req as any).apiKey as string;

  const paidUntil = await getPaidUntil(apiKey);
  if (paidUntil && Date.now() > Number(paidUntil)) {
  }

  next();
}
