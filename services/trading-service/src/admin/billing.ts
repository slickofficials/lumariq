import express from "express";
import { redis } from "../infra/redis";
const router = express.Router();

router.get("/billing/:key", async (req, res) => {
  const data = await redis.hgetall(`apikey:${req.params.key}`);
  res.json(data);
});

export default router;
