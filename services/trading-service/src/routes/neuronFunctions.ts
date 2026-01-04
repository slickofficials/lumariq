import express from "express";
import { listFunctions } from "../neuron/functions";

const router = express.Router();

router.get("/functions", (req, res) => {
  // return only enabled functions; keep it simple for now
  const funcs = listFunctions().filter(f => f.enabled);
  res.json({ count: funcs.length, functions: funcs });
});

export default router;
