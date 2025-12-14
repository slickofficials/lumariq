import { Router } from "express";
import { systemSnapshot } from "../engine/snapshot";

export const snapshotRouter = Router();

snapshotRouter.get("/", async (req, res) => {
  try {
    const data = await systemSnapshot();
    return res.json(data);
  } catch (err) {
    console.error("Snapshot error:", err);
    return res.status(500).json({ error: "Snapshot failed" });
  }
});
