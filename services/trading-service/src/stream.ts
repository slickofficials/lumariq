import type { Express, Response } from "express";

type StreamEvent = {
  type: string;
  payload: any;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
};

const clients = new Set<Response>();

export function setupStreamRoutes(app: Express) {
  app.get("/events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    
    clients.add(res);
    
    req.on("close", () => {
      clients.delete(res);
    });
  });
}

export function pushEvent(event: StreamEvent) {
  if (event.type === 'SURGE_UPDATE' && event.payload > 2.5) {
    event.severity = 'HIGH';
  }

  const data = `data: ${JSON.stringify(event)}\n\n`;
  for (const res of clients) {
    res.write(data);
  }
}
