import { enqueueMatchJob } from "./jobQueue";
import { prisma } from "../prisma";
import { executeMatch } from "./executor";
import { checkCircuitBreaker } from "./circuitBreaker";

/**
 * Match an incoming order against the orderbook
 */
export async function matchOrder(order: {
  id: number;
  symbol: string;
  side: "BUY" | "SELL";
  amount: number;
  price?: number;
}) {
  checkCircuitBreaker(order.price ?? 0);

  const oppositeSide = order.side === "BUY" ? "SELL" : "BUY";

  const match = await prisma.tradeOrder.findFirst({
    where: {
      symbol: order.symbol,
      side: oppositeSide,
      status: "OPEN",
      price:
        order.price != null
          ? order.side === "BUY"
            ? { lte: order.price }
            : { gte: order.price }
          : undefined
    },
    orderBy: { createdAt: "asc" }
  });

  if (!match) {
    return;
  }

  if (order.side === "BUY") {
    await enqueueMatchJob({
      buyOrderId: order.id,
      sellOrderId: match.id,
      price: order.price ?? match.price ?? 0
    });
  } else {
    await enqueueMatchJob({
      buyOrderId: match.id,
      sellOrderId: order.id,
      price: match.price ?? order.price ?? 0
    });
  }
}

/**
 * Used when a virtual / synthetic order is created internally
 */
export async function matchVirtualOrder(
  order: {
    id: number;
    symbol: string;
    side: "BUY" | "SELL";
    amount: number;
    price?: number;
  }
) {
  return matchOrder(order);
}
