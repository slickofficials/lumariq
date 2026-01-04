import { Event } from "./types";
import { appendEvent } from "./ledger";
import { randomUUID } from "crypto";

type Handler = (event: Event) => void | Promise<void>;

const handlers: Partial<Record<string, Handler[]>> = {};

export function subscribe(type: string, handler: Handler) {
  handlers[type] = handlers[type] || [];
  handlers[type]!.push(handler);
}

export async function emit(
  type: Event["type"],
  payload: any,
  meta?: Partial<Event>
) {
  const event: Event = {
    id: randomUUID(),
    type,
    payload,
    timestamp: Date.now(),
    ...meta,
  };

  appendEvent(event);

  const hs = handlers[type] || [];
  for (const h of hs) {
    await Promise.resolve(h(event));
  }

  return event;
}
