// CONTRACT: DO NOT EDIT WITHOUT MIGRATION
// CONTRACT: DO NOT EDIT WITHOUT MIGRATION
import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "lumariq-redis",
  port: 6379,
  maxRetriesPerRequest: 5,
});

const usageKey = (apiKey: string) => `usage:${apiKey}`;
const paidKey = (apiKey: string) => `paid:${apiKey}`;
const creditsKey = (apiKey: string) => `credits:${apiKey}`;

export async function getUsage(apiKey: string): Promise<number> {
  const v = await redis.get(usageKey(apiKey));
  return Number(v || 0);
}

export async function incUsage(apiKey: string, n = 1): Promise<number> {
  return redis.incrby(usageKey(apiKey), n);
}

export async function hitRpm(apiKey: string): Promise<number> {
  return incUsage(apiKey, 1);
}

export async function isPaid(apiKey: string): Promise<boolean> {
  const until = await redis.get(paidKey(apiKey));
  return Number(until || 0) > Date.now();
}

export async function getPaidUntil(apiKey: string): Promise<number> {
  return Number((await redis.get(paidKey(apiKey))) || 0);
}

export async function markPaid(apiKey: string, paidUntil: number): Promise<void> {
  await redis.set(paidKey(apiKey), String(paidUntil));
}

export async function getCredits(apiKey: string): Promise<number> {
  return Number((await redis.get(creditsKey(apiKey))) || 0);
}

export async function addCredits(apiKey: string, amount: number): Promise<number> {
  return redis.incrby(creditsKey(apiKey), amount);
}

export async function spendCredits(apiKey: string, amount: number): Promise<boolean> {
  const current = await getCredits(apiKey);
  if (current < amount) return false;
  await redis.decrby(creditsKey(apiKey), amount);
  return true;
}

export async function downgradeToFree(apiKey: string): Promise<void> {
  await redis.del(`paid:${apiKey}`);
  await redis.del(`credits:${apiKey}`);
}
