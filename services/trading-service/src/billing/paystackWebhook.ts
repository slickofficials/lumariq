import { Request, Response } from "express";
import crypto from "crypto";

const secret = process.env.PAYSTACK_SECRET_KEY!;

export function paystackWebhook(req: Request, res: Response) {
  const hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    return res.status(401).send("Invalid signature");
  }

  const event = req.body;
  if (event.event === "charge.success") {
    // TODO: mark apiKey / user as PAID
  }

  return res.sendStatus(200);
}
