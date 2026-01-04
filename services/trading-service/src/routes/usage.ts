import { Router } from "express";
import { requireApiKey } from "../middleware/requireApiKey";
import { getUsage, getPaidUntil } from "../analytics/redis";

const router = Router();

router.get("/", requireApiKey, async (req, res) => {
  const apiKey = (req as any).apiKey as string;
  const usage = await getUsage(apiKey);
  const paid_until = await getPaidUntil(apiKey);

  res.json({
    usage_today: usage,
    paid_until,
  });
});

export default router;
