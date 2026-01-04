import { redis } from "../infra/redis";

function todayKey() {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function addRevenue(amountNGN: number) {
  const amt = Math.floor(Number(amountNGN || 0));
  if (amt <= 0) return;
  await redis.incrby(`rev:${todayKey()}`, amt);
  await redis.incrby(`rev:all`, amt);
}

export async function getRevenueToday() {
  const v = await redis.get(`rev:${todayKey()}`);
  return Number(v || 0);
}

export async function getRevenueAll() {
  const v = await redis.get(`rev:all`);
  return Number(v || 0);
}
