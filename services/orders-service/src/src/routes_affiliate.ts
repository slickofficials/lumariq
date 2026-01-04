import { Router } from "express";

const r = Router();

/**
 * Affiliate link register (AWIN/Rakuten etc)
 * Stores link metadata (DB later)
 */
r.post("/affiliate/links", async (req, res) => {
  const { userId, network, url, merchant, sku } = req.body || {};
  if (!userId || !network || !url) return res.status(400).json({ error: "missing fields" });

  // TODO persist in DB, validate url, dedupe by (userId, network, url)
  return res.json({ ok: true, link: { userId, network, url, merchant: merchant || null, sku: sku || null } });
});

/**
 * Attach affiliate attribution to an order
 */
r.post("/affiliate/attach", async (req, res) => {
  const { orderId, userId, affiliateUrl } = req.body || {};
  if (!orderId || !userId || !affiliateUrl) return res.status(400).json({ error: "missing fields" });

  // TODO persist attribution in DB and include in ledger memo/settlement
  return res.json({ ok: true, attribution: { orderId, userId, affiliateUrl } });
});

export default r;
