import { Router } from "express";
import { prisma } from "../prisma";

export const jobsRouter = Router();

/**
 * GET /admin/jobs/stats
 */
jobsRouter.get("/stats", async (_req, res) => {
  const [pending, running, done, failed, dead] = await Promise.all([
    prisma.matchJob.count({ where: { status: "PENDING", deadAt: null } }),
    prisma.matchJob.count({ where: { status: "RUNNING", deadAt: null } }),
    prisma.matchJob.count({ where: { status: "DONE", deadAt: null } }),
    prisma.matchJob.count({ where: { status: "FAILED", deadAt: null } }),
    prisma.matchJob.count({ where: { deadAt: { not: null } } })
  ]);

  return res.json({ pending, running, done, failed, dead });
});

/**
 * GET /admin/jobs/dead?take=50
 */
jobsRouter.get("/dead", async (req, res) => {
  const take = Math.min(Number(req.query.take || 50), 200);
  const rows = await prisma.matchJob.findMany({
    where: { deadAt: { not: null } },
    orderBy: { deadAt: "desc" },
    take
  });
  return res.json(rows);
});

/**
 * POST /admin/jobs/retry/:id
 * resets dead/failed job to PENDING
 */
jobsRouter.post("/retry/:id", async (req, res) => {
  const id = Number(req.params.id);
  const job = await prisma.matchJob.findUnique({ where: { id } });
  if (!job) return res.status(404).json({ error: "Job not found" });

  const updated = await prisma.matchJob.update({
    where: { id },
    data: {
      status: "PENDING",
      attempts: 0,
      lastError: null,
      deadAt: null,
      deadReason: null,
      lockedBy: null,
      lockedAt: null,
      lockUntil: null,
      nextRunAt: null
    }
  });

  return res.json({ ok: true, job: updated });
});

/**
 * POST /admin/jobs/purge-dead
 * deletes dead jobs (optional keepLast=N)
 */
jobsRouter.post("/purge-dead", async (req, res) => {
  const keepLast = Math.min(Number((req.body?.keepLast ?? 0)), 5000);

  if (keepLast > 0) {
    const ids = await prisma.matchJob.findMany({
      where: { deadAt: { not: null } },
      select: { id: true },
      orderBy: { deadAt: "desc" },
      take: keepLast
    });

    const keepSet = new Set(ids.map((x) => x.id));

    const allDead = await prisma.matchJob.findMany({
      where: { deadAt: { not: null } },
      select: { id: true }
    });

    const toDelete = allDead.map((x) => x.id).filter((id) => !keepSet.has(id));
    if (toDelete.length === 0) return res.json({ ok: true, deleted: 0 });

    const result = await prisma.matchJob.deleteMany({ where: { id: { in: toDelete } } });
    return res.json({ ok: true, deleted: result.count, kept: keepLast });
  }

  const result = await prisma.matchJob.deleteMany({ where: { deadAt: { not: null } } });
  return res.json({ ok: true, deleted: result.count });
});
