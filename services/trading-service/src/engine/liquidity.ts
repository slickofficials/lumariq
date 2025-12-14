import { prisma } from "../prisma";
import { calculateShares, calculateWithdraw } from "./lp";

export async function addLiquidity(
  symbol: string,
  userId: number | string,
  amountBase: number,
  amountQuote: number
) {
  const pool = await prisma.liquidityPool.findUnique({ include: { providers: true }, 
    where: { symbol },
  });

  if (!pool || !pool.active) {
    throw new Error("Pool unavailable");
  }

  const shares = calculateShares(
    amountBase,
    amountQuote,
    {
      reserveA: pool.baseReserve,
      reserveB: pool.quoteReserve,
      totalShares: pool.totalShares,
    }
  );

  const updatedPool = await prisma.liquidityPool.update({
    where: { id: pool.id },
    data: {
      baseReserve: pool.baseReserve + amountBase,
      quoteReserve: pool.quoteReserve + amountQuote,
      totalShares: pool.totalShares + shares,
    },
  });

  const lp = await prisma.liquidityProvider.create({
    data: {
      poolId: pool.id,
      userId: Number(userId),
      shares,
    },
  });

  return { pool: updatedPool, lp };
}

export async function removeLiquidity(
  symbol: string,
  userId: number | string,
  shares: number
) {
  const pool = await prisma.liquidityPool.findUnique({ include: { providers: true }, 
    where: { symbol },
  });

  if (!pool) throw new Error("Pool not found");

  const lp = await prisma.liquidityProvider.findFirst({ 
    where: {
      poolId: pool.id,
      userId: Number(userId),
    },
  });

  if (!lp || lp.shares < shares) {
    throw new Error("Not enough LP shares");
  }

  const { amountA, amountB } = calculateWithdraw(shares, {
    reserveA: pool.baseReserve,
    reserveB: pool.quoteReserve,
    totalShares: pool.totalShares,
  });

  const updatedPool = await prisma.liquidityPool.update({
    where: { id: pool.id },
    data: {
      baseReserve: pool.baseReserve - amountA,
      quoteReserve: pool.quoteReserve - amountB,
      totalShares: pool.totalShares - shares,
    },
  });

  await prisma.liquidityProvider.update({
    where: { id: lp.id },
    data: { shares: lp.shares - shares },
  });

  return {
    pool: updatedPool,
    withdrawn: { base: amountA, quote: amountB },
    sharesBurned: shares,
  };
}
