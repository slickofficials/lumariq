import express from "express";
import crypto from "crypto";
import { redis } from "../infra/redis";
const router = express.Router();

router.post("/issue", async (_, res) => {
  const key = crypto.randomBytes(16).toString("hex");
  await redis.hset(`apikey:${key}`, { status: "inactive" });
  res.json({ apiKey: key });
});

export default router;
