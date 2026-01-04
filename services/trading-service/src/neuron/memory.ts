import { redis } from "../infra/redis";

export async function remember(agentId: string, key: string, value: any) {
  await redis.hset(`memory:${agentId}`, key, JSON.stringify(value));
}

export async function recall(agentId: string, key: string) {
  const v = await redis.hget(`memory:${agentId}`, key);
  return v ? JSON.parse(v) : null;
}
