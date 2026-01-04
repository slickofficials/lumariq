import express from "express";
import { isPaid, getPaidUntil, getUsage } from "../analytics/redis";
import { requireApiKey } from "../middleware/requireApiKey";
import { getPlanFromPaid, PLAN_QUOTAS } from "../pricing/regionPricing";

export default function meRoutes(redis: any) {
  const router = express.Router();

  router.get("/me", requireApiKey, async (req, res) => {
    const apiKey = (req as any).apiKey as string;
    const paid = await isPaid(apiKey);
    const plan = getPlanFromPaid(paid);
      const paidUntil = await getPaidUntil(apiKey);
    const usage = await getUsage(apiKey);

    res.json({
      apiKey,
      plan,
      paid,
      paid_until: paidUntil,
      quota_daily_units: PLAN_QUOTAS[plan].dailyUnits,
      usage_today: usage
    });
  });

  return router;
}
