export async function verifyBVN(bvn: string) {
  return { ok: true, provider: "NG-BVN", score: 0.95 };
}

export async function verifyNIN(nin: string) {
  return { ok: true, provider: "NG-NIN", score: 0.95 };
}
