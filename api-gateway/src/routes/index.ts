import { Express } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

function proxy(target: string) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    xfwd: true,
    logLevel: "warn",
  });
}

export function registerRoutes(app: Express) {
  // Core health
  app.get("/health", (_req, res) => res.json({ status: "api-gateway ok" }));

  // Users
  app.use("/auth", proxy(process.env.USERS_SERVICE_URL || "http://users-service:4010"));

  // Orders
  app.use("/orders", proxy(process.env.ORDERS_SERVICE_URL || "http://orders-service:4001"));

  // Wallet
  app.use("/wallet", proxy(process.env.WALLET_SERVICE_URL || "http://wallet-service:4002"));

  // Dispatch (ride-hailing / fleets)
  app.use("/dispatch", proxy(process.env.DISPATCH_SERVICE_URL || "http://dispatch-service:4015"));

  // Chat
  app.use("/chat", proxy(process.env.CHAT_SERVICE_URL || "http://chat-service:4020"));
}
