# Referral Events (Canon)

Events:
- referral.user.attributed
- referral.reward.eligible
- referral.reward.applied

Rules:
- One referrer per user (immutable once set)
- Rewards are ledger-backed (idempotent)
- Eligibility triggers:
  - First completed order (user)
  - N completed trips (driver)
  - First revenue event (merchant)

Idempotency Key Pattern:
referral:{program}:{referrerId}:{refereeId}:{reason}:{milestone}
