import { redis } from "../infra/redis";

export async function markPaid(apiKey: string, days = 30) {
  const until = Date.now() + days * 86400000;
  await redis.set(`paid:${apiKey}`, until.toString());
}

export async function isPaid(apiKey: string): Promise<boolean> {
  const v = await redis.get(`paid:${apiKey}`);
  return v ? Number(v) > Date.now() : false;
}
