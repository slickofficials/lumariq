import express from "express";
import { redis } from "../infra/redis";
import { generateApiKey } from "../auth/apiKeys";

const router = express.Router();

router.post("/register", async (req, res) => {
  const email = String(req.body?.email || "");
  if (!email) return res.status(400).json({ error: "email required" });

  const apiKey = generateApiKey();

  await redis.hset(`user:${apiKey}`, {
    email,
    created_at: Date.now()
  });

  res.json({
    apiKey,
    message: "API key created. Keep it secret."
  });
});

export default router;
