import type { Response } from "express";

type StreamEvent = {
  type: string;
  payload: any;
};

const clients = new Set<Response>();

export function addClient(res: Response) {
  clients.add(res);
  res.on("close", () => clients.delete(res));
}

export function pushEvent(event: StreamEvent) {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  for (const res of clients) {
    res.write(data);
  }
}
