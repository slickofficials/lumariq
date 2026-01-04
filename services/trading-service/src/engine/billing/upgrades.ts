const PRO = new Set<string>();
const ENTERPRISE = new Set<string>();

export function upgradeKey(apiKey: string, tier: "PRO" | "ENTERPRISE") {
  if (tier === "ENTERPRISE") ENTERPRISE.add(apiKey);
  else PRO.add(apiKey);
}

export function downgradeKey(apiKey: string) {
  PRO.delete(apiKey);
  ENTERPRISE.delete(apiKey);
}

export function getPaidKeys() {
  return { PRO, ENTERPRISE };
}
