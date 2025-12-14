import { Router } from "express";
import { prisma } from "../prisma";
import { enqueueMatchJob } from "../engine/jobQueue";
import { emitJobEvent } from "../engine/jobEvents";
import { rescheduleJob, markJobDead } from "../engine/dlq";

export const matchQueueRouter = Router();

// POST /match-queue/enqueue
matchQueueRouter.post("/enqueue", async (req, res) => {
  try {
    const { buyOrderId, sellOrderId, price } = req.body || {};
    if (!buyOrderId || !sellOrderId) {
      return res.status(400).json({ error: "buyOrderId and sellOrderId required" });
    }
    const job = await enqueueMatchJob({ buyOrderId, sellOrderId, price });
    return res.json({ ok: true, job });
  } catch (err: any) {
    return res.status(500).json({ error: String(err?.message || err) });
  }
});

// GET /match-queue/jobs?status=PENDING|RUNNING|DONE|FAILED
matchQueueRouter.get("/jobs", async (req, res) => {
  const status = (req.query.status as string | undefined) ?? undefined;
  const take = Math.min(Number(req.query.take || 50), 200);

  const jobs = await prisma.matchJob.findMany({
    where: status ? { status } : undefined,
    orderBy: { id: "desc" },
    take
  });

  return res.json({ ok: true, jobs });
});

// GET /match-queue/dlq
matchQueueRouter.get("/dlq", async (_req, res) => {
  const jobs = await prisma.matchJob.findMany({
    where: { deadAt: { not: null } },
    orderBy: { deadAt: "desc" },
    take: 200
  });
  return res.json({ ok: true, jobs });
});

// POST /match-queue/retry/:id  (immediate retry)
matchQueueRouter.post("/retry/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "invalid id" });

  const job = await prisma.matchJob.update({
    where: { id },
    data: {
      status: "PENDING",
      attempts: 0,
      lastError: null,
      deadAt: null,
      deadReason: null,
      nextRunAt: new Date(), // now
      lockedBy: null,
      lockedAt: null,
      lockUntil: null
    }
  });

  await emitJobEvent("match.job.retried", { jobId: id });
  return res.json({ ok: true, job });
});

// POST /match-queue/requeue/:id?delayMs=5000
matchQueueRouter.post("/requeue/:id", async (req, res) => {
  const id = Number(req.params.id);
  const delayMs = Number(req.query.delayMs || 0);
  if (!id) return res.status(400).json({ error: "invalid id" });

  const job = await rescheduleJob({ jobId: id, delayMs, reason: "manual requeue" });
  return res.json({ ok: true, job });
});

// POST /match-queue/dead/:id  (force dead)
matchQueueRouter.post("/dead/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "invalid id" });

  const reason = String(req.body?.reason || "manual dead");
  const job = await markJobDead({ jobId: id, reason });
  return res.json({ ok: true, job });
});

// GET /match-queue/stats
matchQueueRouter.get("/stats", async (_req, res) => {
  const [pending, running, done, failed, dlq] = await Promise.all([
    prisma.matchJob.count({ where: { status: "PENDING" } }),
    prisma.matchJob.count({ where: { status: "RUNNING" } }),
    prisma.matchJob.count({ where: { status: "DONE" } }),
    prisma.matchJob.count({ where: { status: "FAILED" } }),
    prisma.matchJob.count({ where: { deadAt: { not: null } } })
  ]);

  return res.json({
    ok: true,
    pending,
    running,
    done,
    failed,
    dlq
  });
});
