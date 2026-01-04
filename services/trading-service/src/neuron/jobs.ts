import express from "express";
import { redis } from "../infra/redis";

const router = express.Router();

router.get("/jobs/:id", async (req, res) => {
  const key = `neuron:result:${req.params.id}`;
  const result = await redis.get(key);
  if (!result) return res.status(202).json({ status: "PENDING" });
  res.json({ status: "DONE", result: JSON.parse(result) });
});

export default router;
