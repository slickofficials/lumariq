import { prisma } from "../../prisma";
import type { Plan } from "../plans";

export async function setEntitlement(
  apiKey: string,
  plan: Plan,
  provider?: string,
  status?: string
) {
  return prisma.billingEntitlement.upsert({
    where: { apiKey },
    update: { plan, provider, status },
    create: { apiKey, plan, provider, status }
  });
}

export async function getEntitlement(apiKey: string) {
  return prisma.billingEntitlement.findUnique({ where: { apiKey } });
}

export async function listEntitlements(limit = 200) {
  return prisma.billingEntitlement.findMany({
    take: limit,
    orderBy: { updatedAt: "desc" }
  });
}
