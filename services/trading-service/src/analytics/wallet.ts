import { redis } from "../infra/redis";

export async function getCredits(apiKey: string) {
  const v = await redis.get(`credits:${apiKey}`);
  return Number(v || 0);
}

export async function addCredits(apiKey: string, amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  await redis.incrby(`credits:${apiKey}`, Math.floor(amount));
}

export async function spendCredits(apiKey: string, cost: number) {
  const c = Math.floor(Number(cost || 0));
  if (c <= 0) return true;

  // simple atomic-ish guard (good enough for now)
  const credits = await getCredits(apiKey);
  if (credits < c) return false;
  await redis.decrby(`credits:${apiKey}`, c);
  return true;
}
