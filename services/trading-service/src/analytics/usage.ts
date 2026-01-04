import { redis } from "../infra/redis";
const r = redis;

export async function incUsage(key: string, n=1){
  await r.incrby(`usage:${key}`, n);
}
export async function getUsage(key: string){
  return Number(await r.get(`usage:${key}`)) || 0;
}
