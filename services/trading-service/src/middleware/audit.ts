import { Request, Response, NextFunction } from "express";
import { logUserAction } from "../engine/audit";

export async function auditRequest(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    await logUserAction({
      userId: (req as any).userId,
      action: req.method + " " + req.path,
      metadata: {
        ip: req.ip,
        headers: {
          "user-agent": req.headers["user-agent"]
        }
      }
    });
  } catch {}
  next();
}
