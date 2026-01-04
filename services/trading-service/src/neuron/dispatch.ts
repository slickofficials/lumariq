import { getFunction } from "./registry";
import { runners } from "./runners";
import { recordUsage } from "./meter";

export async function dispatchFunction(
  id: string,
  payload: any,
  ctx?: { apiKey?: string }
) {
  if (!ctx?.apiKey) throw new Error("API key required");

  const fn = getFunction(id);
  if (!fn) throw new Error("Function not found");
  if (fn.status !== "ACTIVE") throw new Error("Function inactive");

  const run = runners[id];
  if (!run) throw new Error("Runner missing");

  await recordUsage(ctx.apiKey, id);
  return run(payload);
}

export const dispatch = dispatchFunction;
