import { redis } from "../infra/redis";

export async function resetDailyUsage() {
  const keys = await redis.keys("usage:*");
  if (keys.length) await redis.del(...keys);
  console.log("🔄 Daily usage reset (UTC)");
}
