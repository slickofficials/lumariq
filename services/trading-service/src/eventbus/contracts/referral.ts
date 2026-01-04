export type ReferralProgram = "user" | "driver" | "merchant";
export type ReferralReason = "first_order" | "n_trips" | "first_revenue";

export type ReferralAttributedEvent = {
  type: "referral.user.attributed";
  ts: string;
  userId: string;           // referee
  referrerId: string;
  program: ReferralProgram;
  code: string;
  country: string;          // NG/BJ/GH...
  meta?: Record<string, any>;
};

export type ReferralEligibleEvent = {
  type: "referral.reward.eligible";
  ts: string;
  program: ReferralProgram;
  referrerId: string;
  refereeId: string;
  country: string;
  reason: ReferralReason;
  milestone: number;        // 1 for first_order/first_revenue; N for trips
  idempotencyKey: string;
  meta?: Record<string, any>;
};

export type ReferralAppliedEvent = {
  type: "referral.reward.applied";
  ts: string;
  program: ReferralProgram;
  referrerId: string;
  refereeId: string;
  country: string;
  reason: ReferralReason;
  amountMinor: number;      // kobo/pesewas etc
  currency: string;         // NGN/GHS/XOF
  ledgerTxId: string;
  idempotencyKey: string;
};
