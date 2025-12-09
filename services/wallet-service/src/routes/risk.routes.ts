import { Router } from "express";
import { evaluateRisk, getRiskProfile } from "../handlers/risk";

const router = Router();

router.post("/evaluate", evaluateRisk);
router.get("/:userId", getRiskProfile);

export default router;
