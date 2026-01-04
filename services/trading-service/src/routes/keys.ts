import express from "express";
import crypto from "crypto";
import { redis } from "../infra/redis";
const r = redis;
const router = express.Router();

router.post("/new", async (_, res)=>{
  const key = crypto.randomBytes(16).toString("hex");
  await r.hset(`apikey:${key}`, "status", "inactive");
  res.json({ apiKey: key });
});

router.post("/revoke", async (req,res)=>{
  const key = req.headers["x-api-key"];
  await r.del(`apikey:${key}`);
  res.json({ revoked: true });
});

export default router;
