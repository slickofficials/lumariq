import { prisma } from "../prisma";

export async function assertIdempotent(key: string) {
  const exists = await prisma.executionIdempotency.findUnique({
    where: { key }
  });
  if (exists) {
    throw new Error("Duplicate execution blocked (idempotency)");
  }
}

export async function markExecuted(key: string, executionId: number) {
  await prisma.executionIdempotency.create({
    data: { key, executionId }
  });
}
