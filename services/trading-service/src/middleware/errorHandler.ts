import type { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const rid = (req as any).requestId || "";
  const code = Number(err?.statusCode || err?.status || 500);

  const msg =
    code >= 500 ? "internal_error" :
    err?.message || "bad_request";

  if (code >= 500) {
    console.error("[ERROR]", { rid, code, msg, err });
  }

  res.status(code).json({ error: msg, request_id: rid });
}
