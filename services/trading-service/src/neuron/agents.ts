export type AgentContext = { country?: string };

export interface Agent {
  id: string;
  handle(fnId: string, payload: any, ctx: AgentContext): Promise<any>;
}

const CoreRouter: Agent = {
  id: "CORE_ROUTER",
  async handle(fnId, payload, ctx) {
    return {
      agent: "CORE_ROUTER",
      fnId,
      payload,
      country: ctx.country,
      reply: "Handled by Core Router"
    };
  }
};

const BillingAgent: Agent = {
  id: "BILLING_AGENT",
  async handle(fnId, payload) {
    return { agent: "BILLING_AGENT", fnId, payload };
  }
};

export const Agents: Agent[] = [CoreRouter, BillingAgent];
