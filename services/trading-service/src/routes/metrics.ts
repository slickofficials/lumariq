import { Router } from "express";
import { prisma } from "../prisma";

export const metricsRouter = Router();

metricsRouter.get("/", async (_req, res) => {
  const [
    users,
    wallets,
    trades,
    pools,
    fees
  ] = await Promise.all([
    prisma.wallet.count(),
    prisma.wallet.findMany(),
    prisma.tradeExecution.count(),
    prisma.liquidityPool.count(),
    prisma.poolFeeState.findMany()
  ]);

  res.json({
    users,
    totalWalletBalance: wallets.reduce((a, w) => a + w.balance, 0),
    trades,
    pools,
    totalFees: fees.reduce((a, f) => a + f.totalFees, 0)
  });
});
