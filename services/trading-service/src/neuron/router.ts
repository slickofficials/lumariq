import express from "express";
import { dispatchFunction } from "./dispatch";
import { billingGuard } from "../middleware/billingGuard";

const router = express.Router();

router.post("/execute", async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"] as string;
    if (!apiKey) {
      return res.status(401).json({ error: "API key required" });
    }

    const { functionId, payload, country } = req.body;

    const allowed = await billingGuard(apiKey);
    if (!allowed) {
      return res.status(402).json({
        error: "Billing required",
        pay: "/billing/init",
      });
    }

    const result = await dispatchFunction(functionId, payload, country);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

export default router;
