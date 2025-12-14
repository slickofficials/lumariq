import { prisma } from "../prisma";
import os from "os";

let startedAt = new Date();

export async function systemSnapshot() {
  const pools = await prisma.liquidityPool.findMany();
  const control = await prisma.globalControl.findUnique({ where: { id: 1 } });
  const openOrders = await prisma.tradeOrder.findMany({ where: { status: "OPEN" } });
  const pendingExecutions = await prisma.tradeExecution.findMany({ orderBy: { id: "desc" }, take: 20 });
  const recentEvents = await prisma.engineEvent.findMany({ orderBy: { id: "desc" }, take: 30 });

  return {
    version: "1.0.0",
    uptimeSeconds: Math.floor((Date.now() - startedAt.getTime()) / 1000),
    node: process.version,
    host: os.hostname(),

    pools,
    control,
    openOrders,
    pendingExecutions,
    recentEvents
  };
}
