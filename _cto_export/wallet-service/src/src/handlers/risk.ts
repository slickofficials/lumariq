import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { computeRiskScore } from "../ai/riskEngine";

export async function evaluateRisk(req: Request, res: Response) {
  try {
    const userId = Number(req.body.userId);
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const orders = await prisma.order.findMany({ where: { userId } });
    const score = computeRiskScore(orders);

    const risk = await prisma.riskProfile.upsert({
      where: { userId },
      create: { userId, score: score.score, severity: score.severity, flags: score.flags },
      update: { score: score.score, severity: score.severity, flags: score.flags },
    });

    return res.json({ risk });
  } catch (err) {
    console.error("Risk evaluate error:", err);
    return res.status(500).json({ error: "Risk evaluation failed" });
  }
}

export async function getRiskProfile(req: Request, res: Response) {
  try {
    const userId = Number(req.params.userId);

    const risk = await prisma.riskProfile.findUnique({ where: { userId } });

    if (!risk) return res.status(404).json({ error: "No risk profile found" });

    return res.json({ risk });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch risk profile" });
  }
}
