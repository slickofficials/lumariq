import { prisma } from "../prisma";
import { settleTrade } from "./settlement";

export async function atomicExecute({
  idempotencyKey,
  executionPayload
}: {
  idempotencyKey: string;
  executionPayload: {
    buyOrderId: number;
    sellOrderId: number;
    price: number;
    amountIn: number;
    amountOut: number;
    poolId: number;
    fee: number;
    buyerId: number;
    sellerId: number;
  };
}) {
  return prisma.$transaction(async (tx) => {
    // Idempotency check
    const existing = await tx.executionIdempotency.findUnique({
      where: { key: idempotencyKey }
    });

    if (existing?.executionId) {
      return tx.tradeExecution.findUnique({
        where: { id: existing.executionId }
      });
    }

    const execution = await tx.tradeExecution.create({
      data: {
        orderId: executionPayload.buyOrderId,
        price: executionPayload.price,
        amountIn: executionPayload.amountIn,
        amountOut: executionPayload.amountOut,
        poolId: executionPayload.poolId
      }
    });

    await tx.executionIdempotency.create({
      data: {
        key: idempotencyKey,
        executionId: execution.id
      }
    });

    await settleTrade({
      buyerId: executionPayload.buyerId,
      sellerId: executionPayload.sellerId,
      poolId: executionPayload.poolId,
      amountIn: executionPayload.amountIn,
      amountOut: executionPayload.amountOut,
      fee: executionPayload.fee
    });

    return execution;
  });
}
