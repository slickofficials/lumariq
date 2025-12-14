import { prisma } from "../prisma";
import { Request, Response, NextFunction } from "express";

export async function rateLimit(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const apiKey = (req as any).apiKey;
  if (!apiKey) return next();

  const now = new Date();
  const window = new Date(now);
  window.setSeconds(0, 0);

  const limit = apiKey.rateLimitRpm ?? 120;

  const usage = await prisma.apiKeyUsage.upsert({
    where: {
      apiKeyId_window: {
        apiKeyId: apiKey.id,
        window
      }
    },
    update: {
      count: { increment: 1 }
    },
    create: {
      apiKeyId: apiKey.id,
      window,
      count: 1
    }
  });

  if (usage.count > limit) {
    return res.status(429).json({
      error: "Rate limit exceeded",
      limit,
      window
    });
  }

  next();
}
