import { Router } from "express";
import { dispatchFunction } from "../neuron/dispatch";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const apiKey = req.header("x-api-key");
    const { functionId, payload } = req.body;

    const result = await dispatchFunction(
      functionId,
      payload,
      { apiKey }
    );

    res.json({ ok: true, result });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

export default router;
