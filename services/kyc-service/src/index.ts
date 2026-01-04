import { verifyBVN, verifyNIN } from "./adapters/ng";

export async function verifyIdentity(input: any) {
  if (input.bvn) return verifyBVN(input.bvn);
  if (input.nin) return verifyNIN(input.nin);
  throw new Error("unsupported identity");
}
