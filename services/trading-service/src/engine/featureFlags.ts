/**
 * Phase 50 — Feature Flags (safe in-memory)
 * DB-backed flags can be added later without breaking runtime.
 */

const GLOBAL_FLAGS = new Set<string>();
const CANARY_FLAGS = new Set<string>();

export function enableFeature(
  key: string,
  scope: "GLOBAL" | "CANARY" = "GLOBAL"
) {
  (scope === "CANARY" ? CANARY_FLAGS : GLOBAL_FLAGS).add(key);
}

export async function isFeatureEnabled(
  key: string,
  scope: "GLOBAL" | "CANARY" = "GLOBAL"
): Promise<boolean> {
  return scope === "CANARY"
    ? CANARY_FLAGS.has(key)
    : GLOBAL_FLAGS.has(key);
}
