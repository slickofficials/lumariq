export const REGION_MAP: Record<string, string[]> = {
  NG: ["user_ai_assistant", "ai_smart_search"],
  GH: ["user_ai_assistant", "ai_smart_search", "ai_predictive_suggestions"],
  KE: ["user_ai_assistant"]
};

export function regionAllowed(country: string, fnId: string) {
  return REGION_MAP[country]?.includes(fnId);
}
