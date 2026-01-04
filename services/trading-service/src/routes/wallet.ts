import { Router } from "express";
import { requireApiKey } from "../middleware/requireApiKey";
import { getCredits, getUsage, getPaidUntil } from "../analytics/redis";

const router = Router();

router.get("/", requireApiKey, async (_req, res) => {
  const key: string = res.locals.apiKey;

  const credits = await getCredits(key);
  const usage = await getUsage(key);
  const paidUntil = await getPaidUntil(key);

  res.json({
    credits,
    usage_today: usage,
    paid_until: paidUntil,
  });
});

export default router;
