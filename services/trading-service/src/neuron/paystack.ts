export async function chargePaystack(
  email: string,
  amountKobo: number,
  reference: string
) {
  const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";

  if (!PAYSTACK_SECRET) {
    return { skipped: true };
  }

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amountKobo,
      reference,
    }),
  });

  return res.json();
}
