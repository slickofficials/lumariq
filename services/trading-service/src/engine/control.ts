import { prisma } from "../prisma";

/**
 * Global trading guard.
 * If GlobalControl row (id=1) exists AND either tradingEnabled=false
 * or circuitBreaker=true, all matching will be blocked.
 */
export async function assertTradingAllowed() {
  const control = await prisma.globalControl.findUnique({
    where: { id: 1 }
  });

  if (control && (!control.tradingEnabled || control.circuitBreaker)) {
    throw new Error("TRADING_DISABLED_BY_ADMIN");
  }
}
