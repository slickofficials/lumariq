export function computeRiskScore(orders: any[]) {
  let total = orders.reduce((sum, o) => sum + o.amount, 0);
  let count = orders.length;

  const score = Math.min(100, Math.floor(total / 50 + count * 2));

  let severity = "low";
  if (score > 70) severity = "high";
  else if (score > 40) severity = "medium";

  const flags = [];
  if (total > 1000) flags.push("HIGH_SPEND");
  if (count > 10) flags.push("MANY_ORDERS");
  if (orders.some(o => o.amount > 500)) flags.push("LARGE_SINGLE_ORDER");

  return { score, severity, flags };
}
