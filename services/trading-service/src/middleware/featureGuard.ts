import { Request, Response, NextFunction } from "express";
import { isFeatureEnabled } from "../engine/featureFlags";

export function featureGuard(featureKey: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const scope = (req as any).isCanary ? "CANARY" : "GLOBAL";
    const enabled = await isFeatureEnabled(featureKey, scope);
    if (!enabled) {
      return res.status(403).json({
        error: "Feature disabled",
        feature: featureKey,
        scope
      });
    }
    next();
  };
}
