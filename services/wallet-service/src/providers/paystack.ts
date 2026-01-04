export async function charge(input: any) {
  return { ok: true, provider: "paystack", ref: "ps_" + Date.now() };
}
