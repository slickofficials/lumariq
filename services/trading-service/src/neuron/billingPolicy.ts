export type Plan = "FREE" | "PRO" | "ENTERPRISE";

export const PLAN_LIMITS: Record<Plan, number> = {
  FREE: 100,
  PRO: 10000,
  ENTERPRISE: Infinity
};

export function resolvePlan(apiKey: string): Plan {
  if (apiKey?.startsWith("ent_")) return "ENTERPRISE";
  if (apiKey?.startsWith("pro_")) return "PRO";
  return "FREE";
}
