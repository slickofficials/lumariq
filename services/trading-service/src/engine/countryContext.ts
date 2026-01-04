import fs from "fs";
import path from "path";

export type Country = {
  country: string;
  iso: string;
  currency: string;
  timezone: string;
  languages: string[];
  payments: Record<string, any>;
  regulation: Record<string, any>;
  features: Record<string, any>;
};

const BASE = path.join(process.cwd(), "country-packs");

export function loadCountryPack(iso: string): Country {
  const p = path.join(BASE, iso.toLowerCase(), "index.json");
  if (!fs.existsSync(p)) {
    throw new Error("Country pack not found: " + iso);
  }
  return JSON.parse(fs.readFileSync(p, "utf8")) as Country;
}
