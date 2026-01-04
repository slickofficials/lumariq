import crypto from "crypto";

export function verifyPaystackSignature(
  rawBody: string,
  signature?: string
): boolean {
  if (!signature) return false;
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET || "";
  const hash = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");
  return hash === signature;
}
