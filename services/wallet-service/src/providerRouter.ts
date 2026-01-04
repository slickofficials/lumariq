import router from "../../canon/payments/router.json";
import * as paystack from "./providers/paystack";
import * as flutterwave from "./providers/flutterwave";

export async function routePayment(country: string, payload: any) {
  const providers = (router as any)[country] || [];
  for (const p of providers) {
    const mod = p === "paystack" ? paystack : flutterwave;
    const res = await mod.charge(payload);
    if (res.ok) return res;
  }
  throw new Error("no_provider_available");
}
