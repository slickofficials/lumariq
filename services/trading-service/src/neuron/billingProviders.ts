export async function chargeStripe(customerId: string, amount: number) {
  return { provider: "stripe", customerId, amount, status: "CHARGED" };
}

export async function chargePaystack(email: string, amount: number) {
  return { provider: "paystack", email, amount, status: "CHARGED" };
}
