import { prisma } from "../prisma";

type Level = { price: number; amount: number };

function aggregateLevels(rows: { price: number | null; amount: number }[], side: "BUY" | "SELL"): Level[] {
  const map = new Map<number, number>();

  for (const r of rows) {
    if (r.price == null) continue;
    const price = Number(r.price);
    const amt = Number(r.amount);
    map.set(price, (map.get(price) ?? 0) + amt);
  }

  const levels = Array.from(map.entries()).map(([price, amount]) => ({ price, amount }));

  // BUY: highest price first. SELL: lowest price first.
  levels.sort((a, b) => (side === "BUY" ? b.price - a.price : a.price - b.price));
  return levels;
}

export async function getOrderBook(symbol: string, depth = 25) {
  const [bidsRaw, asksRaw] = await Promise.all([
    prisma.tradeOrder.findMany({
      where: { symbol, status: "OPEN", side: "BUY" },
      select: { price: true, amount: true }
    }),
    prisma.tradeOrder.findMany({
      where: { symbol, status: "OPEN", side: "SELL" },
      select: { price: true, amount: true }
    })
  ]);

  const bids = aggregateLevels(bidsRaw as any, "BUY").slice(0, depth);
  const asks = aggregateLevels(asksRaw as any, "SELL").slice(0, depth);

  return {
    symbol,
    depth,
    bids,
    asks,
    ts: Date.now()
  };
}
