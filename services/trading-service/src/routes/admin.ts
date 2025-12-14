import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

// 🔴 Disable trading
router.post("/trading/disable", async (_req, res) => {
  await prisma.globalControl.update({
    where: { id: 1 },
    data: { tradingEnabled: false }
  });
  res.json({ ok: true, tradingEnabled: false });
});

// 🟢 Enable trading
router.post("/trading/enable", async (_req, res) => {
  await prisma.globalControl.update({
    where: { id: 1 },
    data: { tradingEnabled: true }
  });
  res.json({ ok: true, tradingEnabled: true });
});

// ⚡ Toggle circuit breaker
router.post("/breaker/:state", async (req, res) => {
  const state = req.params.state === "on";
  await prisma.globalControl.update({
    where: { id: 1 },
    data: { circuitBreaker: state }
  });
  res.json({ ok: true, circuitBreaker: state });
});

export default router;
