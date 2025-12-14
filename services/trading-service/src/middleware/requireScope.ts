import { Request, Response, NextFunction } from "express";

export function requireScope(scope: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const apiKey = (req as any).apiKey;
    if (!apiKey) return res.status(401).json({ error: "Missing API key context" });

    // Support either "scope" string OR "scopes" array
    const s = apiKey.scope;
    const arr = Array.isArray(apiKey.scopes) ? apiKey.scopes : [];

    const ok = s === scope || arr.includes(scope) || (scope === "ADMIN" && s === "ROOT");
    if (!ok) return res.status(403).json({ error: "Insufficient scope", need: scope });

    next();
  };
}
