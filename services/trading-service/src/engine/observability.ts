import { prisma } from "../prisma";

export async function recordEngineEvent(params: {
  type: string;
  context?: string;
  payload: any;
}) {
  try {
    await prisma.engineEvent.create({
      data: {
        type: params.type,
        context: params.context,
        payload: params.payload
      }
    });
  } catch (err) {
    // Observability must never crash trading
    console.error("[ENGINE_EVENT_ERROR]", err);
  }
}
