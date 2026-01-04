import { redis } from "../infra/redis";

export async function recordUsageEvent(evt: {
  apiKey: string;
  route: string;
  units: number;
  plan: string;
}) {
  await redis.xadd(
    "usage_ledger",
    "*",
    "apiKey", evt.apiKey,
    "route", evt.route,
    "units", String(evt.units),
    "plan", evt.plan,
    "ts", String(Date.now())
  );
}
