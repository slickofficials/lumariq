import { quotaGuard } from "../middleware/quotaGuard";
import { Request, Response, NextFunction } from "express";
import { redis } from "../infra/redis";
import { getPlan } from "./plans";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.NEURON_API_KEY;
  const got = req.header("x-api-key");
  if (!expected || got !== expected) {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }
  next();
}

export async function enforceDailyLimit(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const plan = getPlan();
  const key = `neuron:usage:${todayKey()}`;
  const used = await redis.incr(key);
  await redis.expire(key, 172800);

  if (used > plan.dailyLimit) {
    return res.status(429).json({
      error: "RATE_LIMIT",
      plan: plan.tier,
      dailyLimit: plan.dailyLimit,
      used
    });
  }
  next();
}

export function enforcePayloadSize(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const plan = getPlan();
  const size = Buffer.byteLength(JSON.stringify(req.body || {}));
  if (size > plan.maxPayloadBytes) {
    return res.status(413).json({
      error: "PAYLOAD_TOO_LARGE",
      maxPayloadBytes: plan.maxPayloadBytes,
      size
    });
  }
  next();
}
