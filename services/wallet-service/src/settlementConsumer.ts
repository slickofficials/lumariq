import amqp from "amqplib";
import { prisma } from "./prisma";

type SwapEvent = {
  type: "swap";
  userId: number;
  poolSymbol: string;
  side: string;
  symbolIn: string;
  symbolOut: string;
  amountIn: number;
  amountOut: number;
  feeBps: number;
  ts?: string;
};

async function applySwap(e: SwapEvent) {
  const { userId, symbolIn, symbolOut, amountIn, amountOut } = e;

  await prisma.$transaction(async (tx) => {
    // debit symbolIn
    await tx.assetBalance.upsert({
      where: {
        userId_symbol: {
          userId,
          symbol: symbolIn,
        },
      },
      update: {
        available: { decrement: amountIn },
      },
      create: {
        userId,
        symbol: symbolIn,
        available: -amountIn,
        locked: 0,
      },
    });

    // credit symbolOut
    await tx.assetBalance.upsert({
      where: {
        userId_symbol: {
          userId,
          symbol: symbolOut,
        },
      },
      update: {
        available: { increment: amountOut },
      },
      create: {
        userId,
        symbol: symbolOut,
        available: amountOut,
        locked: 0,
      },
    });

    await tx.settlementLog.create({
      data: {
        userId,
        type: "swap",
        symbolIn,
        symbolOut,
        amountIn,
        amountOut,
        raw: e as any,
      },
    });
  });
}

export async function startSettlementConsumer() {
  const url = process.env.RABBITMQ_URL;
  if (!url) {
    throw new Error("RABBITMQ_URL not set");
  }

  const conn = await amqp.connect(url);
  const channel = await conn.createChannel();
  await channel.assertQueue("wallet.settlements");
  console.log("[wallet-service] Listening on wallet.settlements");

  channel.consume("wallet.settlements", async (msg) => {
    if (!msg) return;
    try {
      const payload = JSON.parse(msg.content.toString());

      if (payload.type === "swap") {
        await applySwap(payload as SwapEvent);
        console.log("[wallet-service] Applied swap settlement:", payload);
      } else {
        console.warn("[wallet-service] Unknown settlement type, skipping:", payload);
      }

      channel.ack(msg);
    } catch (err) {
      console.error("[wallet-service] Settlement handler error, message will be acked anyway:", err);
      channel.ack(msg);
    }
  });
}
