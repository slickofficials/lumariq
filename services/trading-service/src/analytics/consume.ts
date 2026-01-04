import { redis } from "../infra/redis";
import { PLAN_QUOTAS } from "../pricing/regionPricing";

export async function consume(apiKey: string, cost: number) {
  const used = Number(await redis.get(`usage:${apiKey}`)) || 0;
  const paidUntil = await redis.get(`paid:${apiKey}`);
  const plan = paidUntil ? "paid" : "free";
  const limit = PLAN_QUOTAS[plan].dailyUnits;

  if (used + cost > limit) {
    throw {
      status: 402,
      body: {
        error: "Quota exceeded",
        plan,
        quota_daily_units: limit,
        usage_today: used
      }
    };
  }

  await redis.incrby(`usage:${apiKey}`, cost);

  return {
    used: used + cost,
    limit,
    plan
  };
}
