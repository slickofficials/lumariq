import { Router } from "express";

const router = Router();

// send message
router.post("/send", async (req, res) => {
  res.json({ delivered: true });
});

// fetch thread
router.get("/thread/:id", async (req, res) => {
  res.json({ messages: [] });
});

export default router;
