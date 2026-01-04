import { Agents } from "./agents";

export async function delegate(
  agentId: string,
  fnId: string,
  payload: any,
  ctx: any
) {
  const agent = Agents.find(a => a.id === agentId);
  if (!agent) throw new Error("Delegation agent not found");
  return agent.handle(fnId, payload, ctx);
}
