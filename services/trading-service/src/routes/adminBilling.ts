import { Plan } from "../types/prisma";
import { Router } from "express";
import { listEntitlements, setEntitlement } from "../engine/billing/entitlements";
import { resolvePlan } from "../engine/plans";

const router = Router();

// GET /admin/billing/entitlements
router.get("/entitlements", async (_req, res) => {
  const rows = await listEntitlements(200);
  res.json({ ok: true, count: rows.length, rows });
});

// POST /admin/billing/entitlements { apiKey, plan }
router.post("/entitlements", async (req, res) => {
  const { apiKey, plan, provider, status } = req.body || {};
  if (!apiKey || !plan) return res.status(400).json({ error: "apiKey + plan required" });
  const row = await setEntitlement(
  String(apiKey),
  await resolvePlan(),
  provider,
  status
);
  res.json({ ok: true, row });
});

export default router;
