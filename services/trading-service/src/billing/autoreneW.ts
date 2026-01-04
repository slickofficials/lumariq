import axios from "axios";
const BASE = "https://api.paystack.co";
const KEY = process.env.PAYSTACK_SECRET_KEY!;

export async function chargeAuth(email: string, authCode: string, amount: number) {
  const r = await axios.post(
    `${BASE}/transaction/charge_authorization`,
    { email, authorization_code: authCode, amount: amount * 100 },
    { headers: { Authorization: `Bearer ${KEY}` } }
  );
  return r.data;
}
