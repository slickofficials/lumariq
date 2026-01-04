import { remember } from "./memory";

export async function learn(agentId: string, signal: string, payload: any) {
  await remember(agentId, signal, payload);
}
