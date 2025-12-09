import { prisma } from "../prisma";

export async function getOrCreatePool(symbol: string) {
  return prisma.liquidityPool.upsert({
    where: { symbol },
    update: {},
    create: {
      symbol,
      baseReserve: 10,
      quoteReserve: 10000,
      feeBps: 30
    }
  });
}

export async function executeAMM(order: any) {
  const pool = await getOrCreatePool(order.symbol);
  const fee = pool.feeBps / 10000;

  const base = pool.baseReserve;
  const quote = pool.quoteReserve;
  const k = base * quote;

  if (order.side === "BUY") {
    const newBase = base - order.quantity;
    if (newBase <= 0) return null;

    const newQuote = k / newBase;
    const costRaw = newQuote - quote;
    const cost = costRaw / (1 - fee);

    await prisma.liquidityPool.update({
      where: { id: pool.id },
      data: {
        baseReserve: newBase,
        quoteReserve: quote + cost
      }
    });

    return cost / order.quantity;
  }

  if (order.side === "SELL") {
    const newBase = base + order.quantity;
    const newQuote = k / newBase;
    const payoutRaw = quote - newQuote;
    const payout = payoutRaw * (1 - fee);

    await prisma.liquidityPool.update({
      where: { id: pool.id },
      data: {
        baseReserve: newBase,
        quoteReserve: quote - payout
      }
    });

    return payout / order.quantity;
  }

  return null;
}
