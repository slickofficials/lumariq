import express from "express";
import { redis } from "../infra/redis";

const router = express.Router();

router.post("/billing/webhook", async (req, res) => {
  const { apiKey, plan } = req.body;
  if (!apiKey || !plan) return res.sendStatus(400);

  await redis.set(`plan:${apiKey}`, plan);
  res.sendStatus(200);
});

export default router;
