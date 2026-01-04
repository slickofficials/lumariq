import { Router } from "express";
import { markPaid, addCredits } from "../analytics/redis";

const router = Router();

router.post("/paystack/webhook", async (req, res) => {
  const { apiKey, amount, paidUntil } = req.body;

  if (apiKey && amount) {
    await addCredits(String(apiKey), amount);
  }

  if (apiKey && paidUntil) {
    await markPaid(String(apiKey), paidUntil);
  }

  res.sendStatus(200);
});

export default router;
