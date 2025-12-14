import { Router } from "express";
import { prisma } from "../prisma";
import { requireApiKey } from "../middleware/apiKey";

export const tradingRouter = Router();

tradingRouter.post("/orders", requireApiKey, async (req, res) => {
  const { symbol, side, amount, price } = req.body;
  const userId = (req as any).userId;

  const order = await prisma.tradeOrder.create({
    data: { symbol, side, amount, price, status: "OPEN", userId }
  });

  res.json(order);
});

tradingRouter.get("/orderbook/:symbol", async (req, res) => {
  const symbol = req.params.symbol;
  const buys = await prisma.tradeOrder.findMany({
    where: { symbol, side: "BUY", status: "OPEN" },
    orderBy: { price: "desc" }
  });
  const sells = await prisma.tradeOrder.findMany({
    where: { symbol, side: "SELL", status: "OPEN" },
    orderBy: { price: "asc" }
  });
  res.json({ buys, sells });
});

tradingRouter.get("/trades/:symbol", async (req, res) => {
  const symbol = req.params.symbol;
  const trades = await prisma.tradeExecution.findMany({
    where: { pool: { symbol } },
    orderBy: { id: "desc" }
  });
  res.json(trades);
});

tradingRouter.get("/balances", requireApiKey, async (req, res) => {
  const userId = (req as any).userId;
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  res.json(wallet);
});
