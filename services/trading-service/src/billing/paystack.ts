import axios from "axios";

const BASE = "https://api.paystack.co";

export async function initCharge(
  email: string,
  amount: number,
  metadata: Record<string, any> = {}
) {
  const res = await axios.post(
    `${BASE}/transaction/initialize`,
    {
      email,
      amount: Math.round(amount * 100),
      metadata,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  return res.data;
}

export async function verifyCharge(reference: string) {
  const res = await axios.get(
    `${BASE}/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  );
  return res.data;
}
