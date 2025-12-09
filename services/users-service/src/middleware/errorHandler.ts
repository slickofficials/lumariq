import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

export function notFoundHandler(req: Request, res: Response, _next: NextFunction) {
  res.status(404).json({
    error: "Not found",
    path: req.path,
  });
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error("Unhandled error", {
    path: req.path,
    message: err?.message,
    stack: err?.stack,
  });

  if (res.headersSent) {
    return;
  }

  const status = err.status || err.statusCode || 500;

  res.status(status).json({
    error: status === 500 ? "Internal server error" : err.message || "Error",
  });
}
