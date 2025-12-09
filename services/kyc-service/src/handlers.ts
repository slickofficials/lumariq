import { prisma } from "./prisma";
import { publishKycStatus } from "./rabbit";
import { Request, Response } from "express";

export async function submitKyc(req: Request, res: Response) {
  const { userId, fullName, idNumber } = req.body;

  const record = await prisma.kycVerification.create({
    data: { userId, fullName, idNumber }
  });

  publishKycStatus(userId, "pending");

  res.json({ status: "submitted", record });
}

export async function getKycStatus(req: Request, res: Response) {
  const userId = req.params.userId;

  const kyc = await prisma.kycVerification.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  if (!kyc) return res.status(404).json({ error: "Not found" });

  res.json(kyc);
}

export async function approveKyc(req: Request, res: Response) {
  const userId = req.params.userId;

  const kyc = await prisma.kycVerification.updateMany({
    where: { userId },
    data: { status: "approved", reason: null }
  });

  publishKycStatus(userId, "approved");

  res.json({ updated: kyc.count });
}

export async function rejectKyc(req: Request, res: Response) {
  const userId = req.params.userId;
  const { reason } = req.body;

  const kyc = await prisma.kycVerification.updateMany({
    where: { userId },
    data: { status: "rejected", reason }
  });

  publishKycStatus(userId, "rejected");

  res.json({ updated: kyc.count });
}