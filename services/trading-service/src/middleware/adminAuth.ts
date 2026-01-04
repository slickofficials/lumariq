import type { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const want = String(process.env.ADMIN_API_KEY || "");
  if (!want) return res.status(500).json({ error: "ADMIN_API_KEY not set" });

  const got = String(req.headers["x-admin-key"] || "");
  if (!got || got !== want) return res.status(401).json({ error: "Admin unauthorized" });

  next();
}
