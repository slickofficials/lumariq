import { redis } from "../infra/redis";

export async function recordUsage(apiKey: string, fnId: string) {
  const key = `usage:${apiKey}:${fnId}`;
  await redis.incr(key);
}
