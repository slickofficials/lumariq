import { prisma } from "../prisma";
import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

/**
 * In-memory hot cache + rpm limiter (per-process).
 * Good enough for single-instance / dev; for multi-instance use Redis.
 */
type CachedKey = {
  record: {
    id: number;
    userId: number;
    key: string;
    active: boolean;
    name: string | null;
    scope: string;
    rateLimitRpm: number;
    revokedAt: Date | null;
  };
  exp: number;
};

const KEY_CACHE = new Map<string, CachedKey>();
const CACHE_TTL_MS = 10_000;

type Window = { startMs: number; count: number };
const RPM_WINDOW = new Map<number, Window>(); // apiKeyId -> minute window

function nowMs() {
  return Date.now();
}

function isKeyFormatValid(k: string) {
  // allow: lumariq_root_xxx OR any non-trivial token (avoid DB spam)
  if (k.length < 24 || k.length > 160) return false;
  return /^[A-Za-z0-9_\-]+$/.test(k);
}

function timingSafeEq(a: string, b: string) {
  // Compare hashes (constant length) to avoid length-based early exits.
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function checkRpm(apiKeyId: number, limit: number) {
  const ms = nowMs();
  const minuteStart = ms - (ms % 60_000);

  const w = RPM_WINDOW.get(apiKeyId);
  if (!w || w.startMs !== minuteStart) {
    RPM_WINDOW.set(apiKeyId, { startMs: minuteStart, count: 1 });
    return { ok: true, remaining: Math.max(0, limit - 1), resetMs: minuteStart + 60_000 };
  }

  if (w.count >= limit) {
    return { ok: false, remaining: 0, resetMs: minuteStart + 60_000 };
  }

  w.count += 1;
  return { ok: true, remaining: Math.max(0, limit - w.count), resetMs: minuteStart + 60_000 };
}

export async function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const key = req.header("x-api-key")?.trim();
  if (!key) return res.status(401).json({ error: "Missing API key" });
  if (!isKeyFormatValid(key)) return res.status(401).json({ error: "Invalid API key format" });

  // Cache read
  const c = KEY_CACHE.get(key);
  if (c && c.exp > nowMs()) {
    const record = c.record;
    if (!record.active || record.revokedAt) return res.status(403).json({ error: "API key revoked/disabled" });

    const rpmLimit = record.rateLimitRpm ?? 120;
    const rpm = checkRpm(record.id, rpmLimit);
    if (!rpm.ok) {
      res.setHeader("Retry-After", String(Math.ceil((rpm.resetMs - nowMs()) / 1000)));
      return res.status(429).json({ error: "Rate limit exceeded", resetAt: new Date(rpm.resetMs).toISOString() });
    }

    req.apiKey = {
      id: record.id,
      userId: record.userId,
      name: record.name,
      scope: record.scope,
      rateLimitRpm: rpmLimit
    };

    // non-blocking lastUsedAt update
    setImmediate(() => {
      prisma.apiKey.update({ where: { id: record.id }, data: { lastUsedAt: new Date() } }).catch(() => {});
    });

    return next();
  }

  // DB fetch
  const record = await prisma.apiKey.findFirst({
    where: { key, active: true },
    select: { id: true, userId: true, key: true, active: true, name: true, scope: true, rateLimitRpm: true, revokedAt: true }
  });

  if (!record) return res.status(403).json({ error: "Invalid API key" });
  if (record.revokedAt) return res.status(403).json({ error: "API key revoked" });

  // Timing-safe confirm
  if (!timingSafeEq(record.key, key)) return res.status(403).json({ error: "Invalid API key" });

  const rpmLimit = record.rateLimitRpm ?? 120;
  const rpm = checkRpm(record.id, rpmLimit);
  if (!rpm.ok) {
    res.setHeader("Retry-After", String(Math.ceil((rpm.resetMs - nowMs()) / 1000)));
    return res.status(429).json({ error: "Rate limit exceeded", resetAt: new Date(rpm.resetMs).toISOString() });
  }

  // Cache write
  KEY_CACHE.set(key, { record: record as any, exp: nowMs() + CACHE_TTL_MS });

  req.apiKey = {
    id: record.id,
    userId: record.userId,
    name: record.name,
    scope: record.scope,
    rateLimitRpm: rpmLimit
  };

  // non-blocking lastUsedAt update
  setImmediate(() => {
    prisma.apiKey.update({ where: { id: record.id }, data: { lastUsedAt: new Date() } }).catch(() => {});
  });

  return next();
}
