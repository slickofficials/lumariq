import { Router } from "express";
import { requireApiKey } from "../middleware/requireApiKey";
import { addCredits, markPaid } from "../analytics/redis";

const router = Router();

router.post("/billing/add-credits", requireApiKey, async (req, res) => {
  const apiKey = (req as any).apiKey as string;
  const { amount } = req.body;

  await addCredits(apiKey, amount);

  res.json({ ok: true });
});

router.post("/billing/mark-paid", requireApiKey, async (req, res) => {
  const apiKey = (req as any).apiKey as string;
  const { paidUntil } = req.body;

  await markPaid(apiKey, paidUntil);

  res.json({ ok: true });
});

export default router;
