import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodRawShape } from "zod";

export const validate =
  (schema: ZodObject<ZodRawShape>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      return res.status(400).json({
        error: "validation_error",
        details: result.error.flatten(),
      });
    }

    req.body = result.data.body;
    req.query = result.data.query as any;
    req.params = result.data.params as any;

    return next();
  };