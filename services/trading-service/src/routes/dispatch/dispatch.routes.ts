import { Router } from "express";

const router = Router();

// user creates ride/order
router.post("/request", async (req, res) => {
  res.json({ status: "REQUESTED", requestId: crypto.randomUUID() });
});

// driver accepts
router.post("/accept", async (req, res) => {
  res.json({ status: "ACCEPTED" });
});

// start trip
router.post("/start", async (req, res) => {
  res.json({ status: "IN_PROGRESS" });
});

// complete trip
router.post("/complete", async (req, res) => {
  res.json({ status: "COMPLETED" });
});

export default router;
