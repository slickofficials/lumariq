import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err.status || 500;

  const payload = {
    error: err.message || "Internal Server Error",
    status,
    requestId: (req as any).requestId || null,
    path: req.originalUrl,
    method: req.method,
    at: new Date().toISOString()
  };

  console.error("❌ API ERROR", payload, err.stack || "");

  res.status(status).json(payload);
}
