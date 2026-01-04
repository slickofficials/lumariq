import { Router } from "express";
import { requireAdmin } from "../../middleware/adminAuth";
import { getRevenueToday, getRevenueAll } from "../../analytics/revenue";

const router = Router();

router.get("/", requireAdmin, async (_req, res) => {
  const today_ngn = await getRevenueToday();
  const all_time_ngn = await getRevenueAll();
  res.json({ today_ngn, all_time_ngn });
});

export default router;
