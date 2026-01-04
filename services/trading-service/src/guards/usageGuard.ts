import { incUsage } from "../analytics/usage";

export async function usageGuard(apiKey: string) {
  const used = Number(await incUsage(apiKey)) || 0;
  if (used > 1000) throw new Error("Usage limit exceeded");
}
