import { redis } from "../infra/redis";

export async function upgradeToPaid(apiKey: string, days = 30) {
  const until = Date.now() + days * 24 * 60 * 60 * 1000;
  await redis.set(`paid:${apiKey}`, until.toString());
}
