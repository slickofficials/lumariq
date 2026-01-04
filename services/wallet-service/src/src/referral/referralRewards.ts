import crypto from "crypto";

type Eligible = {
  program: "user" | "driver" | "merchant";
  referrerId: string;
  refereeId: string;
  country: string;
  reason: "first_order" | "n_trips" | "first_revenue";
  milestone: number;
  idempotencyKey: string;
};

type RewardConfig = {
  currency: string;
  amountMinor: number;
};

// TODO: move into country-packs config (NG/BJ/GH) later
function getRewardConfig(e: Eligible): RewardConfig {
  // Nigeria default
  if (e.country === "NG") {
    if (e.program === "user" && e.reason === "first_order") return { currency: "NGN", amountMinor: 30000 }; // ₦300
    if (e.program === "driver" && e.reason === "n_trips") return { currency: "NGN", amountMinor: 100000 }; // ₦1000
    if (e.program === "merchant" && e.reason === "first_revenue") return { currency: "NGN", amountMinor: 200000 }; // ₦2000
  }
  // fallback
  return { currency: "NGN", amountMinor: 50000 };
}

/**
 * This function must be called by your existing rabbit consumer / event consumer.
 * It should:
 * 1) Check idempotency by key in ledger
 * 2) Apply credit to referrer wallet
 * 3) Emit referral.reward.applied
 */
export async function applyReferralReward(e: Eligible, deps: {
  ledgerHasIdem: (idempotencyKey: string) => Promise<boolean>;
  ledgerCredit: (args: { userId: string; amountMinor: number; currency: string; memo: string; idempotencyKey: string; }) => Promise<{ ledgerTxId: string }>;
  emit: (evt: any) => Promise<void>;
}) {
  const already = await deps.ledgerHasIdem(e.idempotencyKey);
  if (already) return { ok: true, skipped: true };

  const cfg = getRewardConfig(e);
  const memo = `Referral reward (${e.program}:${e.reason}) referee=${e.refereeId} milestone=${e.milestone}`;

  const { ledgerTxId } = await deps.ledgerCredit({
    userId: e.referrerId,
    amountMinor: cfg.amountMinor,
    currency: cfg.currency,
    memo,
    idempotencyKey: e.idempotencyKey,
  });

  await deps.emit({
    type: "referral.reward.applied",
    ts: new Date().toISOString(),
    program: e.program,
    referrerId: e.referrerId,
    refereeId: e.refereeId,
    country: e.country,
    reason: e.reason,
    amountMinor: cfg.amountMinor,
    currency: cfg.currency,
    ledgerTxId,
    idempotencyKey: e.idempotencyKey,
  });

  return { ok: true, skipped: false, ledgerTxId };
}

// helper to standardize idempotency keys
export function referralIdemKey(input: {
  program: Eligible["program"];
  referrerId: string;
  refereeId: string;
  reason: Eligible["reason"];
  milestone: number;
}) {
  const raw = `referral:${input.program}:${input.referrerId}:${input.refereeId}:${input.reason}:${input.milestone}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}
