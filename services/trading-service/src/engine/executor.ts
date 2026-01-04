import { Prisma } from "../__stubs__/prisma";
import { prisma } from "../prisma";
import { settleTrade } from "./settlement";
import { enforceTradingEnabled } from "./risk";
import { assertIdempotent, markExecuted } from "./idempotency";
import { withAtomicExecution } from "./atomic";

export async function executeMatch({
  buyOrderId,
  sellOrderId,
  price,
}: {
  buyOrderId: number;
  sellOrderId: number;
  price: number;
}) {
  return withAtomicExecution(async (tx: Prisma.TransactionClient) => {
    // 🌐 Global trading guard
    await enforceTradingEnabled();

    const buyOrder = await tx.tradeOrder.findUnique({
      where: { id: buyOrderId },
    });
    const sellOrder = await tx.tradeOrder.findUnique({
      where: { id: sellOrderId },
    });

    if (!buyOrder || !sellOrder) {
      throw new Error("Orders not found");
    }

    // ❌ No self-trading
    if (buyOrder.userId === sellOrder.userId) {
      throw new Error("Self-trading is not allowed");
    }

    // 🔄 Side validation
    if (buyOrder.side !== "BUY" || sellOrder.side !== "SELL") {
      throw new Error("Invalid order sides for matching");
    }

    // 🔗 Symbol consistency
    if (buyOrder.symbol !== sellOrder.symbol) {
      throw new Error("Order symbols do not match");
    }

    // ✅ Status check
    if (buyOrder.status !== "OPEN" || sellOrder.status !== "OPEN") {
      throw new Error("Only OPEN orders can be matched");
    }

    // 🧷 Idempotency
    const idemKey = `match:${buyOrder.id}:${sellOrder.id}`;
    await assertIdempotent(idemKey);

    const pool = await tx.liquidityPool.findUnique({
      where: { symbol: buyOrder.symbol },
    });
    if (!pool) {
      throw new Error("Liquidity pool not found");
    }

    const amount = Math.min(buyOrder.amount, sellOrder.amount);
    const fee = (amount * pool.feeBps) / 10_000;

    // 📝 Mark orders as filled
    await tx.tradeOrder.update({
      where: { id: buyOrder.id },
      data: { status: "FILLED" },
    });

    await tx.tradeOrder.update({
      where: { id: sellOrder.id },
      data: { status: "FILLED" },
    });

    // 💾 Record execution
    const execution = await tx.tradeExecution.create({
      data: {
        orderId: buyOrder.id,
        price,
        amountIn: amount,
        amountOut: amount - fee,
        poolId: pool.id,
      },
    });

    // 💸 Settlement
    await settleTrade({
      buyerId: buyOrder.userId,
      sellerId: sellOrder.userId,
      poolId: pool.id,
      amountIn: amount,
      amountOut: amount - fee,
      fee,
    });

    // 🔐 Finalize idempotency
    await markExecuted(idemKey, execution.id);

    return execution;
  });
}
