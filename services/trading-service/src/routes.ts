import { Router } from "express";
import { prisma } from "./prisma";
import { addLiquidity, removeLiquidity } from "./engine/liquidity";
import { publishSettlement } from "./settlement";

const router = Router();

// 🔹 Orders
router.get("/orders", async (_req, res) => {
  const orders = await prisma.tradeOrder.findMany({
    orderBy: { id: "desc" },
  });
  res.json({ orders });
});

// 🔹 Executions
router.get("/executions", async (_req, res) => {
  const executions = await prisma.tradeExecution.findMany({
    orderBy: { id: "desc" },
  });
  res.json({ executions });
});

// 🔹 Pools (list)
router.get("/pools", async (_req, res) => {
  const pools = await prisma.liquidityPool.findMany({
    orderBy: { id: "asc" },
  });
  res.json({ pools });
});

// 🔹 Single pool
router.get("/pools/:symbol", async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const pool = await prisma.liquidityPool.findUnique({
    where: { symbol },
  });
  if (!pool) {
    return res.status(404).json({ error: "Pool not found" });
  }
  res.json({ pool });
});

// 🔹 Create new pool
router.post("/pools", async (req, res) => {
  try {
    const { symbol, baseReserve, quoteReserve, feeBps } = req.body;

    if (!symbol) {
      return res.status(400).json({ error: "symbol is required" });
    }

    const pool = await prisma.liquidityPool.create({
      data: {
        symbol: String(symbol).toUpperCase(),
        baseReserve: Number(baseReserve ?? 0),
        quoteReserve: Number(quoteReserve ?? 0),
        feeBps: feeBps != null ? Number(feeBps) : 30,
      },
    });

    return res.json({ pool });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// 🔹 Add liquidity
router.post("/pools/:symbol/add-liquidity", async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const { userId, amountBase, amountQuote, maxSlippageBps } = req.body;

    const result = await addLiquidity(
      symbol,
      userId,
      Number(amountBase),
      Number(amountQuote));

    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// 🔹 Remove liquidity
router.post("/pools/:symbol/remove-liquidity", async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const { userId, shares } = req.body;

    const result = await removeLiquidity(
      symbol,
      userId,
      Number(shares)
    );

    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// 🔹 Deactivate pool
router.post("/pools/:symbol/deactivate", async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    const pool = await prisma.liquidityPool.update({
      where: { symbol },
      data: { active: false },
    });

    return res.json({ pool });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// 🔹 Swap via AMM + emit settlement event to wallet-service
router.post("/pools/:symbol/swap", async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const { userId, side, amountIn } = req.body;

    if (!userId || !side || !amountIn) {
      return res.status(400).json({ error: "userId, side, amountIn are required" });
    }

    const pool = await prisma.liquidityPool.findUnique({
      where: { symbol },
    });

    if (!pool || !pool.active) {
      return res.status(400).json({ error: "Pool unavailable" });
    }

    const sideUpper = String(side).toUpperCase();
    if (sideUpper !== "BUY" && sideUpper !== "SELL") {
      return res.status(400).json({ error: "side must be BUY or SELL" });
    }

    const amountInNum = Number(amountIn);
    if (amountInNum <= 0) {
      return res.status(400).json({ error: "amountIn must be positive" });
    }

    const feeBps = pool.feeBps;
    const feeMultiplier = 1 - feeBps / 10000;
    const effectiveIn = amountInNum * feeMultiplier;

    const k = pool.baseReserve * pool.quoteReserve;

    let newBase = pool.baseReserve;
    let newQuote = pool.quoteReserve;
    let amountOut: number;

    if (sideUpper === "BUY") {
      // User pays quote (e.g. USDT) and receives base (e.g. BTC)
      newQuote = pool.quoteReserve + effectiveIn;
      newBase = k / newQuote;
      amountOut = pool.baseReserve - newBase;
    } else {
      // SELL: user pays base, receives quote
      newBase = pool.baseReserve + effectiveIn;
      newQuote = k / newBase;
      amountOut = pool.quoteReserve - newQuote;
    }

    if (amountOut <= 0) {
      return res.status(400).json({ error: "amountOut <= 0, invalid swap" });
    }

    const updatedPool = await prisma.liquidityPool.update({
      where: { id: pool.id },
      data: {
        baseReserve: newBase,
        quoteReserve: newQuote,
      },
    });

    // crude symbol split: BTCUSDT -> BTC + USDT
    const baseSymbol = symbol.replace("USDT", "");
    const quoteSymbol = "USDT";

    let symbolIn: string;
    let symbolOut: string;

    if (sideUpper === "BUY") {
      symbolIn = quoteSymbol;
      symbolOut = baseSymbol;
    } else {
      symbolIn = baseSymbol;
      symbolOut = quoteSymbol;
    }

    const event = {
      type: "swap",
      userId: Number(userId),
      poolSymbol: symbol,
      side: sideUpper,
      symbolIn,
      symbolOut,
      amountIn: amountInNum,
      amountOut,
      feeBps,
      ts: new Date().toISOString(),
    };

    publishSettlement(event);

    return res.json({
      symbol,
      side: sideUpper,
      amountIn: amountInNum,
      amountOut,
      feeBps,
      pool: updatedPool,
    });
  } catch (err: any) {
    console.error("[trading-service] swap error", err);
    return res.status(400).json({ error: err.message });
  }
});

export default router;
