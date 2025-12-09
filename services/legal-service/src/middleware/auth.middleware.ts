import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const h = req.headers.authorization;
  if (!h || !h.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    const data = jwt.verify(h.split(" ")[1], process.env.JWT_ACCESS_SECRET || "secret");
    (req as any).user = data;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};