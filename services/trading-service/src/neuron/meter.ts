import { redis } from "../infra/redis";


export async function recordUsage(apiKey: string, fnId: string) {
  const key = `usage:${apiKey}:${fnId}`;
  await redis.incr(key);
  await redis.expire(key, 60 * 60 * 24);
}

export async function getUsage(apiKey: string) {
  const keys = await redis.keys(`usage:${apiKey}:*`);
  const data: Record<string, number> = {};
  for (const k of keys) {
    const count = await redis.get(k);
    data[k.split(":").pop()!] = Number(count || 0);
  }
  return data;
}
