import { recordEngineEvent } from "./observability";

export async function emitJobEvent(type: string, payload: Record<string, any>) {
  try {
    await recordEngineEvent({
      type,
      context: "job.queue",
      payload
    });
  } catch (err) {
    // never block core flow
    console.error("[JOB_EVENT_ERROR]", type, err);
  }
}
