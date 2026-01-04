import { Agents } from "./agents";

export function listAgents() {
  return Agents.map(a => a.id);
}
