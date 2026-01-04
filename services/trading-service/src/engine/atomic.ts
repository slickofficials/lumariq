import { Prisma } from "../__stubs__/prisma";
import { prisma } from "../prisma";

export async function withAtomicExecution<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    return fn(tx);
  });
}
