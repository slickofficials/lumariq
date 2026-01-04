import fs from "fs";
import path from "path";

export function loadCountryPack(code: string) {
  const p = path.join(process.cwd(), "country-packs", code, "index.json");
  if (!fs.existsSync(p)) {
    throw new Error(`Country pack not found: ${code}`);
  }
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
