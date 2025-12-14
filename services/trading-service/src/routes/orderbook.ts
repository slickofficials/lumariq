import { Router } from "express";
import { getOrderBook } from "../engine/orderbook";
import { perSymbolLimiter } from "../middleware/perSymbolRateLimit";

export const orderbookRouter = Router();

// Rate limit per symbol (and per API key if present)
orderbookRouter.get("/:symbol", perSymbolLimiter({ windowMs: 60_000, max: 120 }), async (req, res) => {
  try {
    const symbol = String(req.params.symbol || "").toUpperCase();
    const depth = req.query.depth ? Math.min(200, Math.max(1, Number(req.query.depth))) : 25;
    if (!symbol) return res.status(400).json({ error: "Missing symbol" });

    const book = await getOrderBook(symbol, depth);
    return res.json(book);
  } catch (err) {
    console.error("orderbook error:", err);
    return res.status(500).json({ error: "Orderbook failed" });
  }
});
