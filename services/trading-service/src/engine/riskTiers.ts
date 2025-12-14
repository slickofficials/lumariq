export type RiskTier = "BASIC" | "PRO" | "ADMIN";

export function getRiskLimits(tier: RiskTier) {
  switch (tier) {
    case "ADMIN":
      return { maxTrade: Infinity, dailyLimit: Infinity };
    case "PRO":
      return { maxTrade: 250_000, dailyLimit: 2_000_000 };
    default:
      return { maxTrade: 50_000, dailyLimit: 250_000 };
  }
}
