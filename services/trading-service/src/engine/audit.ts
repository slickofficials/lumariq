import { prisma } from "../prisma";

export async function logUserAction(params: {
  userId?: number;
  apiKeyId?: number;
  action: string;
  entity?: string;
  entityId?: number;
  metadata?: unknown;
}) {
  try {
    await prisma.userActionLog.create({
      data: {
        userId: params.userId,
        apiKeyId: params.apiKeyId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        metadata: params.metadata as any
      }
    });
  } catch (err) {
    // Never block execution
    console.error("[AUDIT_LOG_ERROR]", err);
  }
}
