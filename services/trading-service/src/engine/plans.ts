export type Plan = "FREE" | "BASIC" | "PRO" | "ENTERPRISE";

export const PLAN_LIMITS: Record<Plan, { daily: number }> = {
  FREE: { daily: 100 },
  BASIC: { daily: 1_000 },
  PRO: { daily: 10_000 },
  ENTERPRISE: { daily: Number.POSITIVE_INFINITY }
};

export function normalizePlan(p: unknown): Plan {
  const v = String(p ?? "").trim().toUpperCase();
  if (v === "FREE" || v === "BASIC" || v === "PRO" || v === "ENTERPRISE") return v;
  return "FREE";
}

/**
 * resolvePlan() is intentionally simple for now:
 * - later it can read from DB entitlements / API key records.
 */
export async function resolvePlan(apiKey?: string): Promise<Plan> {
  void apiKey;
  return "FREE";
}
