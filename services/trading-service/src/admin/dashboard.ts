import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "Admin dashboard placeholder"
  });
});

export default router;
