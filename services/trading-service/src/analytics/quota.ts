import { redis } from "../infra/redis";
import { FUNCTION_COSTS } from "../pricing/functionCosts";
import { PLAN_QUOTAS } from "../pricing/regionPricing";
import { isPaid } from "../billing/paid";

export async function consume(apiKey: string, fn: string) {
  const cost = FUNCTION_COSTS[fn] ?? 1;
  const paid = await isPaid(apiKey);
  const plan = paid ? "paid" : "free";
  const limit = PLAN_QUOTAS[plan].dailyUnits;

  const used = Number(await redis.get(`usage:${apiKey}`) || 0);
  if (used + cost > limit) {
    throw { status: 402, body: {
      error: "Quota exceeded",
      plan,
      quota_daily_units: limit,
      usage_today: used
    }};
  }

  await redis.incrby(`usage:${apiKey}`, cost);

  return {
    plan,
    limit,
    used: used + cost
  };
}
