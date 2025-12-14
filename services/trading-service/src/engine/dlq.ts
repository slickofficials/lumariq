import { prisma } from "../prisma";
import { emitJobEvent } from "./jobEvents";

export async function markJobDead(params: {
  jobId: number;
  reason: string;
}) {
  const job = await prisma.matchJob.update({
    where: { id: params.jobId },
    data: {
      status: "FAILED",
      deadAt: new Date(),
      deadReason: params.reason,
      lockedBy: null,
      lockedAt: null,
      lockUntil: null,
      nextRunAt: null
    }
  });

  await emitJobEvent("match.job.dead", {
    jobId: job.id,
    reason: params.reason
  });

  return job;
}

export async function rescheduleJob(params: {
  jobId: number;
  delayMs: number;
  reason?: string;
}) {
  const next = new Date(Date.now() + params.delayMs);

  const job = await prisma.matchJob.update({
    where: { id: params.jobId },
    data: {
      status: "PENDING",
      nextRunAt: next,
      lastError: params.reason ?? null,
      lockedBy: null,
      lockedAt: null,
      lockUntil: null
    }
  });

  await emitJobEvent("match.job.rescheduled", {
    jobId: job.id,
    nextRunAt: next.toISOString(),
    reason: params.reason ?? null
  });

  return job;
}
