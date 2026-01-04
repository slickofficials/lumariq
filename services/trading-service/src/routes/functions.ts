import { Router } from "express";
import { requireApiKey } from "../middleware/requireApiKey";
import { consume } from "../analytics/consume";
import { FUNCTION_COSTS } from "../pricing/functionCosts";

const router = Router();

/**
 * AUTH FIRST
 */
router.use(requireApiKey);

/**
 * LIST FUNCTIONS (costed)
 */
router.get("/", async (req, res) => {
  try {
    const apiKey = (req as any).apiKey as string;

    // FORCE numeric cost
    const cost: number = Number(FUNCTION_COSTS["functions:list"] ?? 1);

    const q = await consume(apiKey, cost);

    res.set({
      "X-Quota-Limit": String(q.limit),
      "X-Quota-Used": String(q.used),
      "X-Quota-Remaining": String(q.limit - q.used)
    });

    return res.json({
      count: 0,
      functions: []
    });
  } catch (e: any) {
    return res
      .status(e?.status || 500)
      .json(e?.body || { error: "Internal error" });
  }
});

export default router;
