export type Plan = "free" | "pro" | "enterprise";
export type FunctionDef = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  plans: Plan[];
  cost: number;          // usage units per call
  ratePerMin: number;    // soft limit (enforced by middleware later)
};

export const FUNCTIONS: Record<string, FunctionDef> = {
  "ai.user_assistant": {
    id: "ai.user_assistant",
    title: "AI User Assistant",
    description: "General assistant for user questions and guidance.",
    enabled: true,
    plans: ["free", "pro", "enterprise"],
    cost: 1,
    ratePerMin: 60,
  },

  // Add more here as you ship them:
  // "shop.whatsapp_bot": {...}
};

export function listFunctions() {
  return Object.values(FUNCTIONS);
}

export function getFunctionDef(functionId: string) {
  return FUNCTIONS[functionId];
}
