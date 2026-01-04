import { Express } from "express";

// core routes
import dispatchRoutes from "./dispatch/dispatch.routes";
import chatRoutes from "./chat/chat.routes";

// health check
export function registerRoutes(app: Express) {
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "trading-service" });
  });

  // mobility / dispatch / rides
  app.use("/api/dispatch", dispatchRoutes);

  // messaging
  app.use("/api/chat", chatRoutes);
}
