/**
 * Lightweight in-process settlement event bus.
 * Phase 16 target:
 *   - emit events from executor / settlement engine
 *   - later swap internals for RabbitMQ / Kafka without touching callers
 */

export type SettlementEventType =
  | "TRADE_EXECUTED"
  | "SETTLEMENT_REQUESTED"
  | "SETTLEMENT_CONFIRMED"
  | "SETTLEMENT_FAILED";

export interface SettlementEvent {
  id: string;
  type: SettlementEventType;
  referenceId: number; // e.g. tradeExecution.id
  payload?: Record<string, unknown>;
  createdAt: Date;
}

type Listener = (event: SettlementEvent) => void;

const listeners: Listener[] = [];

/**
 * Subscribe to settlement events (for future services, webhooks, etc.)
 */
export function onSettlementEvent(listener: Listener) {
  listeners.push(listener);
}

/**
 * Emit a settlement event to all listeners.
 * For now this is in-memory. Later, Phase 16B can plug RabbitMQ here.
 */
export function emitSettlementEvent(
  event: Omit<SettlementEvent, "createdAt">
): SettlementEvent {
  const full: SettlementEvent = {
    ...event,
    createdAt: new Date(),
  };

  for (const listener of listeners) {
    try {
      listener(full);
    } catch (err) {
      // Fail soft – metrics / logging hook could go here
      // eslint-disable-next-line no-console
      console.error("Settlement listener error:", err);
    }
  }

  return full;
}

/**
 * Tiny helper to generate a simple event id.
 * You can swap this with UUID later without changing emitters.
 */
export function generateSettlementEventId(prefix: string = "set") {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;
}
