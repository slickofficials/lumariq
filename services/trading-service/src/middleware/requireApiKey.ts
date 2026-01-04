import { Request, Response, NextFunction } from "express";

export function requireApiKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const key =
    req.header("x-api-key") ||
    req.header("authorization")?.replace("Bearer ", "");

  if (!key) {
    return res.status(401).json({ error: "API key required" });
  }

  res.locals.apiKey = key;
  next();
}
