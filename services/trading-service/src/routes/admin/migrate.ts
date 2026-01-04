import { Router } from "express";
import { requireAdmin } from "../../middleware/adminAuth";
import { redis } from "../../infra/redis";

const router = Router();

router.post("/", requireAdmin, async (req, res) => {
  const apiKey = String(req.body?.apiKey || "");
  if (!apiKey) return res.status(400).json({ error: "apiKey required" });

  // normalize defaults if missing
  const plan = (await redis.get(`plan:${apiKey}`)) || "free";
  const quota = (await redis.get(`quota:${apiKey}`)) || (plan === "free" ? "50" : "5000");

  await redis.set(`plan:${apiKey}`, plan);
  await redis.set(`quota:${apiKey}`, quota);

  // paid until should be numeric (stringified number) or null
  const paidUntil = await redis.get(`paid:${apiKey}`);
  if (paidUntil && !/^\d+$/.test(paidUntil)) {
    // if corrupted, downgrade
    await redis.del(`paid:${apiKey}`);
    await redis.set(`plan:${apiKey}`, "free");
    await redis.set(`quota:${apiKey}`, "50");
  }

  res.json({ ok: true, apiKey, plan: await redis.get(`plan:${apiKey}`), quota: Number(await redis.get(`quota:${apiKey}`) || 0) });
});

export default router;
