import { prisma } from "../prisma";
import { createExecution } from "./executor";
import { executeAMM } from "./amm";

export async function matchOrder(order: any) {
  const saved = await prisma.tradeOrder.create({ data: order });

  const opposite = order.side === "BUY" ? "SELL" : "BUY";

  const match = await prisma.tradeOrder.findFirst({
    where: {
      symbol: order.symbol,
      side: opposite,
      status: "OPEN",
      price: opposite === "SELL"
        ? { lte: order.price }
        : { gte: order.price }
    },
    orderBy: { createdAt: "asc" }
  });

  if (match) {
    if (order.side === "BUY") await createExecution(saved, match);
    else await createExecution(match, saved);
    return;
  }

  console.log("🧪 No orderbook match → AMM fallback");

  const ammPrice = await executeAMM(saved);
  if (!ammPrice) return;

  const virtual = await prisma.tradeOrder.create({
    data: {
      userId: 0,
      symbol: order.symbol,
      side: opposite,
      quantity: order.quantity,
      price: ammPrice,
      status: "FILLED"
    }
  });

  if (order.side === "BUY") await createExecution(saved, virtual);
  else await createExecution(virtual, saved);
}
