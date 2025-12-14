import { Router } from "express";
import { systemHeartbeat } from "../engine/heartbeat";

export const heartbeatRouter = Router();

heartbeatRouter.get("/", async (req, res) => {
  const status = await systemHeartbeat();

  if (status.status === "RED") {
    return res.status(500).json(status);
  }

  res.json(status);
});
