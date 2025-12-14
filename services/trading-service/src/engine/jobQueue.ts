import { prisma } from "../prisma";
import { emitJobEvent } from "./jobEvents";

export async function enqueueMatchJob(params: {
  buyOrderId: number;
  sellOrderId: number;
  price?: number;
}) {
  const job = await prisma.matchJob.create({
    data: {
      buyOrderId: params.buyOrderId,
      sellOrderId: params.sellOrderId,
      price: params.price ?? null,
      status: "PENDING",
      attempts: 0
    }
  });

  await emitJobEvent("match.job.enqueued", {
    jobId: job.id,
    buyOrderId: params.buyOrderId,
    sellOrderId: params.sellOrderId,
    price: params.price ?? null
  });

  return job;
}
