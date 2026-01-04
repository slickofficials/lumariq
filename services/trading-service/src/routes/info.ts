import { Router } from "express";
import { requireApiKey } from "../middleware/requireApiKey";
import { getUsage, isPaid, getPaidUntil, hitRpm } from "../analytics/redis";
import { PLAN_QUOTAS } from "../pricing/regionPricing";

const router = Router();

router.get("/info", requireApiKey, async (req, res) => {
  try {
    const apiKey = (req as any).apiKey as string;

    const usage = await getUsage(apiKey);
    const paid = await isPaid(apiKey);
    const plan = paid ? "paid" : "free";
    const quota = PLAN_QUOTAS[plan].dailyUnits;
    const paidUntil = await getPaidUntil(apiKey);

    const rpmBlocked = await hitRpm(apiKey);

    res.json({
      plan,
      usage_today: usage,
      quota_daily_units: quota,
      rpm_blocked: rpmBlocked,
      paid_until: paidUntil
    });
  } catch (e) {
    console.error("INFO ERROR:", e);
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
