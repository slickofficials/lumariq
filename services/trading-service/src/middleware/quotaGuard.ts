import { Request, Response, NextFunction } from "express";
import { spendCredits, getUsage, incUsage, isPaid, hitRpm } from "../analytics/redis";
import { FUNCTION_PRICING } from "../pricing/functionPricing";

export async function quotaGuard(req: Request, res: Response, next: NextFunction) {
  const COST_FROM_PRICING = (req: any) => { try { const sig = `${req.method} ${req.route?.path || req.path || ""}`; return Number(FUNCTION_PRICING[sig] || 1); } catch { return 1; } };

const apiKey = (req as any).apiKey as string;

  const key = `${req.method} ${req.route?.path || req.path}`;
  const cost = FUNCTION_PRICING[key] ?? 1;

  const ok = await spendCredits(apiKey, cost);
  if (!ok) {
    return res.status(402).json({ error: "Insufficient credits" });
  }

  await incUsage(apiKey, cost);
  await hitRpm(apiKey);

  next();
}
