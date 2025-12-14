import { Request, Response, NextFunction } from "express";

/**
 * Admin IP allowlist
 * Set ADMIN_IP_ALLOWLIST="1.2.3.4,5.6.7.8,::1"
 * If empty/undefined => allow all (dev-friendly).
 */
export function adminIpAllowlist(req: Request, res: Response, next: NextFunction) {
  const allow = (process.env.ADMIN_IP_ALLOWLIST || "").trim();
  if (!allow) return next();

  const allowed = allow.split(",").map(s => s.trim()).filter(Boolean);

  // Express may include ::ffff:127.0.0.1 – normalize a bit
  const ip = (req.ip || "").replace("::ffff:", "");
  const xff = (req.headers["x-forwarded-for"] as string | undefined);
  const firstXff = xff ? xff.split(",")[0].trim().replace("::ffff:", "") : "";

  const candidateIps = [ip, firstXff].filter(Boolean);

  const ok = candidateIps.some(v => allowed.includes(v));
  if (!ok) {
    return res.status(403).json({
      error: "Admin IP not allowed",
      ip,
      xForwardedFor: xff || null
    });
  }
  next();
}
