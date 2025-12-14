import { prisma } from "../prisma";

export async function systemHeartbeat() {
  const status: any = {
    status: "GREEN",
    db: true,
    tradingEnabled: true,
    circuitBreaker: false,
    poolCount: 0,
    issues: []
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    status.status = "RED";
    status.db = false;
    status.issues.push("Database unreachable");
  }

  const control = await prisma.globalControl.findUnique({ where: { id: 1 } });

  if (!control) {
    status.status = "RED";
    status.issues.push("Missing GlobalControl record");
  } else {
    status.tradingEnabled = control.tradingEnabled;
    status.circuitBreaker = control.circuitBreaker;

    if (!control.tradingEnabled) {
      status.status = "YELLOW";
      status.issues.push("Trading disabled");
    }
    if (control.circuitBreaker) {
      status.status = "RED";
      status.issues.push("Circuit breaker triggered");
    }
  }

  const pools = await prisma.liquidityPool.count();
  status.poolCount = pools;
  if (pools === 0) {
    status.status = "RED";
    status.issues.push("No liquidity pools available");
  }

  return status;
}
