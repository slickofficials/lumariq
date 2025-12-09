import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createAgreement = (data: {
  userId: string;
  type: string;
  version: string;
  url: string;
}) => {
  return prisma.agreement.create({ data });
};

export const signAgreementVersion = (data: {
  userId: string;
  type: string;
  version: string;
}) => {
  return prisma.agreement.create({
    data: {
      userId: data.userId,
      type: data.type,
      version: data.version,
      url: "signed_digital_record",
      signedAt: new Date()
    }
  });
};

export const fetchUserAgreements = (userId: string) => {
  return prisma.agreement.findMany({
    where: { userId },
    orderBy: { signedAt: "desc" }
  });
};