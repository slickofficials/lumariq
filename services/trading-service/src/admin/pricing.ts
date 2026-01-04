import express from "express";
import { getRegionPrice } from "../pricing/regionPricing";

const router = express.Router();

router.get("/pricing/:country", (req, res) => {
  res.json(getRegionPrice(req.params.country));
});

export default router;
