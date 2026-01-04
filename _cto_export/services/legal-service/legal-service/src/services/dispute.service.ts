import { PrismaClient } from "@prisma/client";
import { uploadBufferToS3 } from "./s3.service";
import { v4 } from "uuid";

const prisma = new PrismaClient();

export const createNewDispute = (data: {
  userId: string;
  orderId?: string;
  category: string;
  description: string;
}) => {
  return prisma.dispute.create({ data });
};

export const attachDisputeFile = async (id: string, file: Express.Multer.File) => {
  const key = `legal/disputes/${id}/${v4()}_${file.originalname}`;
  const url = await uploadBufferToS3(file.buffer, key, file.mimetype);

  return prisma.dispute.update({
    where: { id },
    data: { attachment: url }
  });
};

export const listAllDisputes = () => {
  return prisma.dispute.findMany({
    orderBy: { openedAt: "desc" }
  });
};