import express from "express";
import { redis } from "../infra/redis";

const router = express.Router();

router.get("/revenue", async (_, res) => {
  const keys = await redis.keys("usage:*");
  let total = 0;

  for (const k of keys) {
    total += Number(await redis.get(k) || 0);
  }

  res.json({
    total_api_calls: total,
    estimated_revenue_usd: total * 0.01
  });
});

export default router;
