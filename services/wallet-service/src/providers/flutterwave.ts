export async function charge(input: any) {
  return { ok: true, provider: "flutterwave", ref: "fw_" + Date.now() };
}
