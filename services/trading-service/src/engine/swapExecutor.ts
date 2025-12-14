import { prisma } from "../prisma";
import { getAmountOut, assertSlippage } from "./swap";

export async function swapExactIn(
  symbol: string,
  userId: number | string,
  amountIn: number,
  side: "BUY" | "SELL",
  minAmountOut?: number
) {
  const pool = await prisma.liquidityPool.findUnique({ include: { providers: true }, 
    where: { symbol }
  });

  if (!pool || !pool.active) {
    throw new Error("Pool unavailable");
  }

  let amountOut: number;

  if (side === "BUY") {
    // user gives QUOTE, receives BASE
    amountOut = getAmountOut(
      amountIn,
      pool.quoteReserve,
      pool.baseReserve,
      pool.feeBps
    );

    assertSlippage(amountOut, minAmountOut);

    await prisma.liquidityPool.update({
      where: { id: pool.id },
      data: {
        quoteReserve: pool.quoteReserve + amountIn,
        baseReserve: pool.baseReserve - amountOut
      }
    });
  } else {
    // user gives BASE, receives QUOTE
    amountOut = getAmountOut(
      amountIn,
      pool.baseReserve,
      pool.quoteReserve,
      pool.feeBps
    );

    assertSlippage(amountOut, minAmountOut);

    await prisma.liquidityPool.update({
      where: { id: pool.id },
      data: {
        baseReserve: pool.baseReserve + amountIn,
        quoteReserve: pool.quoteReserve - amountOut
      }
    });
  }

  return {
    symbol,
    side,
    amountIn,
    amountOut,
    feeBps: pool.feeBps
  };
}
