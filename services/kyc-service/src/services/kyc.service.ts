import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createKycRecord = (data: { userId: string; docUrl: string; selfieUrl: string }) => {
  return prisma.kycRecord.create({
    data: {
      userId: data.userId,
      docUrl: data.docUrl,
      selfieUrl: data.selfieUrl,
      status: "pending"
    }
  });
};

export const getKycRecord = (id: string) => {
  return prisma.kycRecord.findUnique({ where: { id } });
};

export const listKycRecords = () => {
  return prisma.kycRecord.findMany({ orderBy: { submittedAt: "desc" } });
};