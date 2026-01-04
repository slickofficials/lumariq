export const FUNCTION_PRICES: Record<string, number> = {
  "ai.user_assistant": 50,        // ₦50
  "ai.smart_search": 20,
  "commerce.marketplace.multi_store": 200,
};

export function priceFor(functionId: string) {
  return FUNCTION_PRICES[functionId] || 10;
}
