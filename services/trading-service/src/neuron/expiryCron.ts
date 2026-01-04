import { redis } from "../infra/redis";

export async function expireKeys() {
  const keys = await redis.keys("apikey:*");
  const now = Math.floor(Date.now() / 1000);

  for (const key of keys) {
    const until = await redis.hget(key, "paid_until");
    if (until && Number(until) < now) {
      await redis.del(key);
      console.log("🔒 EXPIRED", key);
    }
  }
}

setInterval(expireKeys, 60 * 60 * 1000); // hourly
console.log("⏱️ Expiry cron running");
