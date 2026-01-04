export type PlanTier = "free" | "starter" | "pro";

export type Plan = {
  tier: PlanTier;
  dailyLimit: number;
  maxPayloadBytes: number;
};

export const PLANS: Record<PlanTier, Plan> = {
  free: {
    tier: "free",
    dailyLimit: 10,
    maxPayloadBytes: 20_000
  },
  starter: {
    tier: "starter",
    dailyLimit: 1_000,
    maxPayloadBytes: 200_000
  },
  pro: {
    tier: "pro",
    dailyLimit: 1_000_000,
    maxPayloadBytes: 1_000_000
  }
};

export function getPlan(): Plan {
  const tier = (process.env.NEURON_PLAN || "starter") as PlanTier;
  const plan = PLANS[tier] || PLANS.starter;

  const envLimit = Number(process.env.NEURON_DAILY_LIMIT);
  return !Number.isNaN(envLimit) && envLimit > 0
    ? { ...plan, dailyLimit: envLimit }
    : plan;
}
