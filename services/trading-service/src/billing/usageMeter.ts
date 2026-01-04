export function chargeUsage(apiKey: string, fnId: string) {
  // TODO: replace with Redis/Postgres
  console.log('[BILLING]', apiKey, fnId);
  return { charged: true };
  const pricing = require("../pricing/regionPricing");
  console.log("[PRICING]", pricing.getRegionPrice("NG"));
}
