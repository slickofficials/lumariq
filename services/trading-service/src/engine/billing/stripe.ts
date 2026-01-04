import Stripe from "stripe";

export function verifyStripeEvent(rawBody: Buffer, sigHeader: string | undefined) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET || "";
  if (!sigHeader) throw Object.assign(new Error("Missing stripe signature"), { status: 401 });
  if (!secret) throw Object.assign(new Error("Missing STRIPE_WEBHOOK_SECRET"), { status: 500 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
    // apiVersion removed
  });

  return stripe.webhooks.constructEvent(rawBody, sigHeader, secret);
}
