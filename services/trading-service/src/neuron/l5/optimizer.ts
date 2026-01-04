import { SystemState } from "./state";

export function optimize(state: SystemState) {
  const actions: string[] = [];

  if (state.fraudPressure > 0.7) {
    actions.push("TIGHTEN_KYC");
    actions.push("LOWER_LIMITS");
  }

  if (state.liquidityIndex < 0.6) {
    actions.push("PROMOTE_TOPUPS");
    actions.push("DELAY_PAYOUTS");
  }

  if (state.logisticsStress > 0.5) {
    actions.push("SURGE_PRICING");
    actions.push("ROUTE_REBALANCE");
  }

  if (state.demandIndex > 1.4) {
    actions.push("INCREASE_SUPPLY");
    actions.push("FLASH_INCENTIVES");
  }

  return actions;
}
