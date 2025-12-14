import { Router } from "express";
import { prisma } from "../prisma";
import { randomBytes } from "crypto";

export const adminSecurityRoutes = Router();

/**
 * All endpoints here assume requireApiKey already wrapped them.
 * Keep it simple: ADMIN scope required.
 */
function ensureAdmin(req: any, res: any) {
  const scope = req.apiKey?.scope || "ADMIN";
  if (scope !== "ADMIN") {
    res.status(403).json({ error: "ADMIN scope required" });
    return false;
  }
  return true;
}

// GET /admin/security/keys
adminSecurityRoutes.get("/keys", async (req, res) => {
  if (!ensureAdmin(req, res)) return;

  const keys = await prisma.apiKey.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, userId: true, key: true, active: true,
      name: true, scope: true, rateLimitRpm: true,
      lastUsedAt: true, revokedAt: true, createdAt: true
    }
  });

  // Don't leak full key by default — mask it
  const masked = keys.map(k => ({
    ...k,
    key: k.key.slice(0, 14) + "…" + k.key.slice(-8)
  }));

  res.json({ ok: true, keys: masked });
});

// POST /admin/security/keys  (create)
// body: { userId?: number, name?: string, scope?: "ADMIN"|"WORKER", rateLimitRpm?: number, prefix?: string }
adminSecurityRoutes.post("/keys", async (req, res) => {
  if (!ensureAdmin(req, res)) return;

  const userId = Number(req.body?.userId ?? 1);
  const name = req.body?.name ? String(req.body.name) : null;
  const scope = req.body?.scope ? String(req.body.scope) : "ADMIN";
  const rateLimitRpm = req.body?.rateLimitRpm ? Number(req.body.rateLimitRpm) : 120;
  const prefix = req.body?.prefix ? String(req.body.prefix) : "lumariq_";

  const key = prefix + randomBytes(24).toString("hex");

  const created = await prisma.apiKey.create({
    data: { key, userId, active: true, name, scope, rateLimitRpm }
  });

  // Return FULL key ONCE here (this is the only time you see it)
  res.json({
    ok: true,
    apiKey: {
      id: created.id,
      userId: created.userId,
      name: created.name,
      scope: created.scope,
      rateLimitRpm: created.rateLimitRpm,
      createdAt: created.createdAt,
      key
    }
  });
});

// POST /admin/security/keys/:id/revoke
adminSecurityRoutes.post("/keys/:id/revoke", async (req, res) => {
  if (!ensureAdmin(req, res)) return;

  const id = Number(req.params.id);
  const k = await prisma.apiKey.update({
    where: { id },
    data: { active: false, revokedAt: new Date() }
  });

  res.json({ ok: true, revoked: { id: k.id, revokedAt: k.revokedAt } });
});

// POST /admin/security/keys/:id/rotate  (revoke old + create new; returns FULL new key once)
// body: { prefix?: string }
adminSecurityRoutes.post("/keys/:id/rotate", async (req, res) => {
  if (!ensureAdmin(req, res)) return;

  const id = Number(req.params.id);
  const old = await prisma.apiKey.findUnique({ where: { id } });
  if (!old) return res.status(404).json({ error: "Key not found" });

  const prefix = req.body?.prefix ? String(req.body.prefix) : "lumariq_";
  const newKey = prefix + randomBytes(24).toString("hex");

  await prisma.$transaction([
    prisma.apiKey.update({ where: { id }, data: { active: false, revokedAt: new Date() } }),
    prisma.apiKey.create({
      data: {
        key: newKey,
        userId: old.userId,
        active: true,
        name: old.name,
        scope: old.scope,
        rateLimitRpm: old.rateLimitRpm
      }
    })
  ]);

  res.json({ ok: true, rotatedFrom: id, newKey }); // FULL new key shown once
});
