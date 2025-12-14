import { Router } from "express";

let TRADING_ENABLED = true;
let WORKERS_ENABLED = true;

export const adminControlRoutes = Router();

adminControlRoutes.post("/pause-trading", (_req, res) => {
  TRADING_ENABLED = false;
  res.json({ ok: true, trading: "paused" });
});

adminControlRoutes.post("/resume-trading", (_req, res) => {
  TRADING_ENABLED = true;
  res.json({ ok: true, trading: "resumed" });
});

adminControlRoutes.post("/pause-workers", (_req, res) => {
  WORKERS_ENABLED = false;
  res.json({ ok: true, workers: "paused" });
});

adminControlRoutes.post("/resume-workers", (_req, res) => {
  WORKERS_ENABLED = true;
  res.json({ ok: true, workers: "resumed" });
});

export function isTradingEnabled() {
  return TRADING_ENABLED;
}

export function areWorkersEnabled() {
  return WORKERS_ENABLED;
}
