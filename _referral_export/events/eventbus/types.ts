export type EventType =
  | "USER_CREATED"
  | "ORDER_CREATED"
  | "PAYMENT_INITIATED"
  | "PAYMENT_CONFIRMED"
  | "ENTITLEMENT_CHANGED"
  | "USAGE_RECORDED"
  | "AGENT_ACTION"
  | "SYSTEM_ALERT";

export interface Event<T = any> {
  id: string;
  type: EventType;
  payload: T;
  actor?: string;
  country?: string;
  timestamp: number;
}
