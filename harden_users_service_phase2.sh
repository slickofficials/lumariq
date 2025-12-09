#!/usr/bin/env bash
set -euo pipefail

echo "🔥 Hardening users-service (Phase 2: logger + error handling + clean app)..."

cd services/users-service

mkdir -p src/lib src/middleware src/routes

echo "📚 Writing src/lib/logger.ts..."
cat > src/lib/logger.ts << 'EOL'
export const logger = {
  info: (...args: any[]) => console.log("[INFO]", ...args),
  warn: (...args: any[]) => console.warn("[WARN]", ...args),
  error: (...args: any[]) => console.error("[ERROR]", ...args),
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[DEBUG]", ...args);
    }
  },
};
EOL

echo "📚 Writing src/middleware/requestLogger.ts..."
cat > src/middleware/requestLogger.ts << 'EOL'
import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(
      req.method,
      req.originalUrl,
      res.statusCode,
      duration + "ms"
    );
  });

  next();
}
EOL

echo "📚 Writing src/middleware/errorHandler.ts..."
cat > src/middleware/errorHandler.ts << 'EOL'
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
EOL

echo "📚 Writing src/app.ts..."
cat > src/app.ts << 'EOL'
import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import authRouter from "./routes/auth.routes";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export function createApp(): Application {
  const app = express();

  // Core middlewares
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(morgan("combined"));

  // App-level logging
  app.use(requestLogger);

  // Routes
  app.use("/auth", authRouter);

  // Healthcheck
  app.get("/health", (_req, res) => {
    res.json({ status: "users-service ok" });
  });

  // 404 + error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
EOL

echo "📚 Writing src/server.ts..."
cat > src/server.ts << 'EOL'
import { createApp } from "./app";
import { logger } from "./lib/logger";

const PORT = process.env.PORT || 4001;

const app = createApp();

app.listen(PORT, () => {
  logger.info(\`users-service listening on port \${PORT}\`);
});
EOL

echo "📚 Writing src/index.ts (thin wrapper)..."
cat > src/index.ts << 'EOL'
import { createApp } from "./app";

export { createApp };
EOL

echo "✅ Phase 2 hardening files written for users-service."
echo "Next:"
echo "  cd services/users-service"
echo "  rm -rf dist"
echo "  npm run build"
echo "  npm run dev"
