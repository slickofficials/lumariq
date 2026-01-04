import crypto from "crypto";

export function generateReferralCode(userId: string) {
  // short, URL-safe
  const hash = crypto.createHash("sha256").update(userId).digest("base64url");
  return `LQ-${hash.slice(0, 8).toUpperCase()}`;
}

/**
 * On signup, if referralCode exists:
 * - resolve referrerId
 * - persist referee.referrerId + referee.referralCodeUsed (immutable)
 * - emit referral.user.attributed
 */
export async function attributeReferral(input: {
  userId: string;
  referralCode?: string;
  country: string;
}, deps: {
  findUserByReferralCode: (code: string) => Promise<{ id: string } | null>;
  setReferrerOnce: (args: { userId: string; referrerId: string; code: string }) => Promise<boolean>;
  emit: (evt: any) => Promise<void>;
}) {
  if (!input.referralCode) return { attributed: false };

  const ref = await deps.findUserByReferralCode(input.referralCode);
  if (!ref) return { attributed: false };

  const ok = await deps.setReferrerOnce({ userId: input.userId, referrerId: ref.id, code: input.referralCode });
  if (!ok) return { attributed: false }; // already had referrer

  await deps.emit({
    type: "referral.user.attributed",
    ts: new Date().toISOString(),
    userId: input.userId,
    referrerId: ref.id,
    program: "user",
    code: input.referralCode,
    country: input.country,
  });

  return { attributed: true, referrerId: ref.id };
}
