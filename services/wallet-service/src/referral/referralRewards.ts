export async function applyReferralReward(evt: any, deps: any) {
  const key = `referral:${evt.userId}:${evt.orderId}`;

  if (await deps.ledgerHasIdem(key)) return;

  await deps.ledgerCredit({
    userId: evt.userId,
    amountMinor: 500,
    currency: "NGN",
    memo: "Referral bonus",
    idempotencyKey: key,
  });

  await deps.emit({
    type: "referral.reward.paid",
    userId: evt.userId,
    amount: 500,
  });
}
