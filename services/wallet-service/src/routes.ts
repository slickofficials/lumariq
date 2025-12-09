import { Router } from "express";
import { prisma } from "./prisma";
import { publishOrder } from "./rabbit";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "wallet-service ok" });
});

/**
 * 🚀 CREATE ORDER (send to trading-service)
 */
router.post("/orders", async (req, res) => {
  try {
    const order = req.body;

    if (!order.userId || !order.symbol || !order.side || !order.quantity || !order.price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    publishOrder(order);

    return res.json({
      status: "queued",
      order
    });
  } catch (err: any) {
    console.error("Order publish error:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;

// 🔹 Get balances for a user (Phase 10 helper)
router.get("/balances/:userId", async (req, res) => {
  const userId = Number(req.params.userId);
  if (!userId) {
    return res.status(400).json({ error: "Invalid userId" });
  }

  const balances = await prisma.assetBalance.findMany({
    where: { userId },
    orderBy: { symbol: "asc" },
  });

  res.json({ userId, balances });
});

// 🔹 Credit a user's balance (test funding)
router.post("/balances/credit", async (req, res) => {
  try {
    const { userId, symbol, amount } = req.body;
    if (!userId || !symbol || amount == null) {
      return res.status(400).json({ error: "userId, symbol, amount required" });
    }

    const result = await prisma.assetBalance.upsert({
      where: {
        userId_symbol: {
          userId: Number(userId),
          symbol: String(symbol).toUpperCase(),
        },
      },
      update: {
        available: { increment: Number(amount) },
      },
      create: {
        userId: Number(userId),
        symbol: String(symbol).toUpperCase(),
        available: Number(amount),
        locked: 0,
      },
    });

    res.json({ balance: result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
);
