import { Router } from "express";
import { prisma } from "../prisma";

export const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch {
    res.status(500).json({ status: "db_error" });
  }
});
