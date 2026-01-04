import { PLAN_LIMITS, resolvePlan, Plan } from "./plans";

export type Bucket =
  | 'DEFAULT'
  | 'SEARCH'
  | 'AI'
  | 'BILLING'
  | 'WEBHOOK'
  | 'ADMIN';

export type UsageInfo = {
  plan: Plan;
  limit: number;      // numeric daily limit
  used: number;       // numeric daily used
  remaining: number;  // numeric
  day: string;        // YYYY-MM-DD
  bucket: Bucket;
  bucketCount: number;
};

function todayKey(d = new Date()): string {
  // YYYY-MM-DD in UTC (stable)
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * TODO: Back this with Prisma (apiKeyUsage table).
 * For now compile-safe + deterministic:
 */
async function getUsed(apiKey: string, bucket: Bucket, day: string): Promise<number> {
  void apiKey; void bucket; void day;
  return 0;
}

export async function getUsageInfo(apiKey: string, bucket: Bucket = "DEFAULT"): Promise<UsageInfo> {
  const plan: Plan = await resolvePlan(apiKey);
  const day = todayKey();
  const used = await getUsed(apiKey, bucket, day);

  const limit = PLAN_LIMITS[plan].daily;
  const remaining = Number.isFinite(limit) ? Math.max(0, limit - used) : Number.POSITIVE_INFINITY;

  return {
    plan,
    limit,
    used,
    remaining,
    day,
    bucket,
    bucketCount: used
  };
}

/**
 * hit() keeps signature stable; you can wire it to DB later.
 */
export async function hit(apiKey: string, bucket: Bucket, weight = 1) {
  void apiKey; void bucket; void weight;
  return true;
}
