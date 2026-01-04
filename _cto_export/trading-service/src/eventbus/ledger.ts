import fs from "fs";
import path from "path";
import { Event } from "./types";

const LEDGER_PATH = path.resolve("data/event-ledger.jsonl");
fs.mkdirSync(path.dirname(LEDGER_PATH), { recursive: true });

export function appendEvent(event: Event) {
  fs.appendFileSync(LEDGER_PATH, JSON.stringify(event) + "\n");
}
