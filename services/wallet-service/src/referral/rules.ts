export type CountryCode = "NG" | "BJ" | "GH";

export const referralRules: Record<CountryCode, {
  signupBonus: number;
  firstOrderBonus: number;
  rideBonus: number;
}> = {
  NG: { signupBonus: 500, firstOrderBonus: 1000, rideBonus: 700 },
  BJ: { signupBonus: 400, firstOrderBonus: 800, rideBonus: 600 },
  GH: { signupBonus: 600, firstOrderBonus: 1200, rideBonus: 800 },
};

export function getReferralReward(
  country: CountryCode,
  type: "signup" | "order" | "ride"
) {
  const r = referralRules[country];
  if (type === "signup") return r.signupBonus;
  if (type === "order") return r.firstOrderBonus;
  return r.rideBonus;
}
