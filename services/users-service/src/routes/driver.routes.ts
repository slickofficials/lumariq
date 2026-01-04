import { Router } from "express";

const r = Router();

/**
 * Driver onboarding (NG-first)
 * - accepts basic profile + documents references
 * - emits kyc.start (later)
 */
r.post("/drivers/onboard", async (req, res) => {
  const { userId, fullName, phone, vehicleType, nin, bvn, docs } = req.body || {};

  if (!userId || !fullName || !phone || !vehicleType) {
    return res.status(400).json({ error: "missing required fields" });
  }

  // NOTE: store in DB later (prisma). For now: just a stable API contract.
  // TODO: emit event "kyc.start" with payload { userId, nin, bvn, docs, role: "DRIVER" }

  return res.json({
    ok: true,
    driver: {
      userId,
      fullName,
      phone,
      vehicleType,
      kyc: { status: "PENDING", country: "NG", nin: !!nin, bvn: !!bvn, docs: !!docs }
    }
  });
});

export default r;
