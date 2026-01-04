import { Router } from "express";
import { submitKyc, getKycStatus, approveKyc, rejectKyc } from "./handlers";
import { kycSchema } from "./validation";

const router = Router();

router.post("/submit", async (req, res) => {
  const parsed = kycSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  return submitKyc(req, res);
});

router.get("/status/:userId", getKycStatus);

router.post("/approve/:userId", approveKyc);
router.post("/reject/:userId", rejectKyc);

export default router;