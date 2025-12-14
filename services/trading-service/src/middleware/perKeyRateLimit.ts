import { Request, Response, NextFunction } from "express";

type Bucket = { resetAt: number; used: number };
const buckets = new Map<string, Bucket>();

export function perKeyRateLimit(req: Request, res: Response, next: NextFunction) {
  const auth = (req as any).auth as { apiKeyId: number; rateLimitRpm: number } | undefined;
  const keyId = auth?.apiKeyId ? String(auth.apiKeyId) : "anon";
  const limit = Math.max(10, Number(auth?.rateLimitRpm ?? 120)); // sane floor

  const now = Date.now();
  const windowMs = 60_000;

  const b = buckets.get(keyId);
  if (!b || now >= b.resetAt) {
    buckets.set(keyId, { resetAt: now + windowMs, used: 1 });
    res.setHeader("X-RateLimit-Limit", String(limit));
    res.setHeader("X-RateLimit-Remaining", String(limit - 1));
    return next();
  }

  if (b.used >= limit) {
    const retrySec = Math.ceil((b.resetAt - now) / 1000);
    res.setHeader("Retry-After", String(retrySec));
    res.setHeader("X-RateLimit-Limit", String(limit));
    res.setHeader("X-RateLimit-Remaining", "0");
    return res.status(429).json({ error: "Rate limit exceeded" });
  }

  b.used += 1;
  res.setHeader("X-RateLimit-Limit", String(limit));
  res.setHeader("X-RateLimit-Remaining", String(limit - b.used));
  next();
}
