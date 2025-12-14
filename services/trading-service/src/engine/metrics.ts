import { prisma } from "../prisma";

export async function getSystemMetrics() {
  const [
    pending,
    running,
    done,
    failed,
    dlq,
    apiKeys,
    rateHits
  ] = await Promise.all([
    prisma.matchJob.count({ where: { status: "PENDING" } }),
    prisma.matchJob.count({ where: { status: "RUNNING" } }),
    prisma.matchJob.count({ where: { status: "DONE" } }),
    prisma.matchJob.count({ where: { status: "FAILED" } }),
    prisma.matchJob.count({ where: { deadAt: { not: null } } }),
    prisma.apiKey.count({ where: { active: true } }),
    prisma.apiKeyUsage.count()
  ]);

  return {
    jobs: { pending, running, done, failed, dlq },
    apiKeys,
    rateHits,
    at: new Date()
  };
}
