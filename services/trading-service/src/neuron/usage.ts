/**
 * NEURON USAGE CANON
 * Tracks executions per key (email / plan / function)
 */

export type UsageMap = Record<string, number>;

const usage: UsageMap = {};

/** Increment usage counter */
export function recordUsage(key: string, inc: number = 1): number {
  usage[key] = (usage[key] || 0) + inc;
  return usage[key];
}

/** Snapshot current usage */
export function usageSnapshot(): UsageMap {
  return { ...usage };
}
