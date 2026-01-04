import fs from "fs";
import { Event } from "./types";
import { emit } from "./bus";

export async function replayLedger(path = "data/event-ledger.jsonl") {
  if (!fs.existsSync(path)) return;

  const lines = fs.readFileSync(path, "utf8").split("\n").filter(Boolean);
  for (const line of lines) {
    const event: Event = JSON.parse(line);
    await emit(event.type, event.payload, event);
  }
}
