import { redis } from "../infra/redis";

export async function getUsage7d(apiKey: string) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push({
      day: i,
      used: Number(await redis.get(`usage:${apiKey}`) || 0)
    });
  }
  return days;
}
