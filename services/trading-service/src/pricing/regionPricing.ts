export type Region = "NG" | "GH" | "BJ" | "DEFAULT";
export type Plan = "free" | "pro" | "enterprise";

export function normalizeRegion(x: string | undefined): Region {
  const v = (x || "").toUpperCase();
  if (v === "NG" || v === "GH" || v === "BJ") return v;
  return "DEFAULT";
}

export const PLAN_QUOTAS: Record<Plan, { dailyUnits: number }> = {
  free: { dailyUnits: 50 },        // tweak
  pro: { dailyUnits: 5000 },       // tweak
  enterprise: { dailyUnits: 50000 } // tweak
};

export function getPlanFromPaid(isPaid: boolean): Plan {
  return isPaid ? "pro" : "free";
}

/**
 * TEMP compatibility for admin/pricing
 * Post-launch: remove admin dependency on this
 */
export function getRegionPrice(region: string) {
  const r = normalizeRegion(region);
  return {
    daily: PLAN_QUOTAS.free.dailyUnits,
    monthly: PLAN_QUOTAS.pro.dailyUnits
  };
}
