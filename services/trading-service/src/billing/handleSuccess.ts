import { redis } from "../infra/redis";

/**
 * Keep this minimal + compile-safe.
 * Update business logic later, but NEVER create Redis clients here.
 */
export async function handleSuccess(payload: any) {
  // example: mark an event processed (idempotency)
  if (payload?.eventId) {
    await redis.set(`billing:event:${payload.eventId}`, "1", "EX", 60 * 60);
  }
  return { ok: true };
}

export default handleSuccess;
