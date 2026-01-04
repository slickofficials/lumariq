import { Router } from "express";

const v1 = Router();

v1.get("/", (_req, res) => {
  res.json({
    version: "v1",
    status: "ok",
    ts: new Date().toISOString()
  });
});

export default v1;
