import rules from "../../../canon/security/waf.rules.json";
import { Request, Response, NextFunction } from "express";

export function waf(req: Request, res: Response, next: NextFunction) {
  const payload = JSON.stringify(req.body || "") + req.url;
  for (const r of (rules as any).rules) {
    if (new RegExp(r.pattern, "i").test(payload)) {
      return res.status(403).json({ error: "blocked_by_waf", rule: r.id });
    }
  }
  next();
}
