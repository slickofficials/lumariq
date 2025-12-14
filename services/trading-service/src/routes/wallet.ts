import { Router } from "express";
import { prisma } from "../prisma";
import { requireApiKey } from "../middleware/apiKey";

export const walletRouter = Router();

walletRouter.post("/deposit", requireApiKey, async (req, res) => {
  const { amount } = req.body;
  const userId = (req as any).userId;

  const wallet = await prisma.wallet.update({
    where: { userId },
    data: { balance: { increment: amount } }
  });

  res.json(wallet);
});

walletRouter.post("/withdraw", requireApiKey, async (req, res) => {
  const { amount } = req.body;
  const userId = (req as any).userId;

  const wallet = await prisma.wallet.update({
    where: { userId },
    data: { balance: { decrement: amount } }
  });

  res.json(wallet);
});
