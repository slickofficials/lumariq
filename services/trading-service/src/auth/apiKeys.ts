import crypto from "crypto";

export function generateApiKey() {
  return "lum_" + crypto.randomBytes(24).toString("hex");
}
