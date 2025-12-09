import { prisma } from "../prisma";
import { pushEvent } from "../stream";

export async function createExecution(buy: any, sell: any) {
  const quantity = Math.min(buy.quantity, sell.quantity);
  const price = sell.price;

  const [buyUpdated, sellUpdated] = await Promise.all([
    prisma.tradeOrder.update({
      where: { id: buy.id },
      data: { status: "FILLED" }
    }),
    prisma.tradeOrder.update({
      where: { id: sell.id },
      data: { status: "FILLED" }
    })
  ]);

  const execution = await prisma.tradeExecution.create({
    data: {
      buyOrderId: buyUpdated.id,
      sellOrderId: sellUpdated.id,
      price,
      quantity
    }
  });

  pushEvent({ type: "order_filled", payload: buyUpdated });
  pushEvent({ type: "order_filled", payload: sellUpdated });
  pushEvent({ type: "execution", payload: execution });

  console.log(
    `✅ Execution #${execution.id} → BUY ${buyUpdated.id} / SELL ${sellUpdated.id}`
  );

  return execution;
}
