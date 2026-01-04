import { Express } from "express";

export function registerChatRoutes(app: Express) {
  app.post("/api/chat/send", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/chat/history/:roomId", (_req, res) => {
    res.json({ messages: [] });
  });
}
