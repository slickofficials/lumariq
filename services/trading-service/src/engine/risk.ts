import { prisma } from "../prisma";

export async function checkCircuitBreaker(price: number) {
  if (price <= 0) throw new Error("Invalid price");
}

export async function checkUserRisk(userId: number) {
  const openOrders = await prisma.tradeOrder.count({
    where: {
      userId,
      status: "OPEN"
    }
  });

  if (openOrders > 50) {
    throw new Error("Risk limit exceeded: too many open orders");
  }

  return true;
}

// ✅ Alias for executor compatibility
export async function checkTradingEnabled() {
  // reuse existing guard
  return assertTradingAllowed();
}

// ✅ Canonical trading guard
export async function enforceTradingEnabled() {
  const control = await prisma.globalControl.findUnique({ where: { id: 1 } });
  if (!control || !control.tradingEnabled) {
    throw new Error("Trading is globally disabled");
  }
}

// ✅ Legacy alias
export async function assertTradingAllowed() {
  return enforceTradingEnabled();
}
