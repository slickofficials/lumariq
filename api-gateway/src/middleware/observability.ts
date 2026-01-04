import { Request, Response, NextFunction } from "express";

export function obs(req: Request, _res: Response, next: NextFunction) {
  const start = Date.now();
  res.on("finish", () => {
    console.log(JSON.stringify({
      path: req.path,
      method: req.method,
      status: res.statusCode,
      latency: Date.now() - start
    }));
  });
  next();
}
