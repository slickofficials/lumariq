/**
 * Lumariq Canon Event Contracts (append-only)
 * Keep payloads stable. Deprecate; don't delete.
 */

export type BaseEvent = {
  type: string;
  ts?: string; // ISO
  country?: string; // NG/BJ/GH...
  requestId?: string;
};

export type OrderCompletedEvent = BaseEvent & {
  type: "order.completed";
  orderId: number;
  userId: number;
  amountMinor: number;
  currency: string;
};

export type RideCompletedEvent = BaseEvent & {
  type: "ride.completed";
  rideId: string;
  driverId: string;
  passengerId: string;
  amountMinor: number;
  currency: string;
  // optional: future (when dispatch knows mapping)
  referrerUserId?: number;
  refereeUserId?: number;
};

export type ReferralEligibleEvent = BaseEvent & {
  type: "referral.reward.eligible";
  referrerUserId: number;
  refereeUserId: number;
  trigger: "order.completed" | "ride.completed";
  amountMinor: number;
  currency: string;
  sourceId: string; // orderId/rideId
};

export type WalletCreditEvent = BaseEvent & {
  type: "wallet.credit";
  userId: number;
  amount: number; // minor units
  currency: string;
  reference: string; // idempotency key
  memo?: string;
};

export type LumariqEvent =
  | OrderCompletedEvent
  | RideCompletedEvent
  | ReferralEligibleEvent
  | WalletCreditEvent
  | (BaseEvent & Record<string, any>); // extension-safe

export function isObject(v: any): v is Record<string, any> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

export function isEvent(v: any): v is LumariqEvent {
  return isObject(v) && typeof v.type === "string";
}
