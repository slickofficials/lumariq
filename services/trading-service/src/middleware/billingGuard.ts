import { redis } from "../infra/redis";

export async function billingGuard(apiKey: string) {
  const paidUntil = await redis.get(`paid:${apiKey}`);
  if (!paidUntil) return false;
  return Number(paidUntil) > Date.now();
}
