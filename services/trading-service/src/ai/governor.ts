import models from "../../../canon/ai/models.json";
import policies from "../../../canon/ai/policies.json";

export function authorize(modelId: string, context: string) {
  const model = (models as any).models.find((m:any)=>m.id===modelId);
  if (!model || !model.allowed) throw new Error("model_blocked");

  const rule = (policies as any).rules.find((r:any)=>r.type===context);
  return { ok: true, rule };
}

export function killSwitch() {
  if ((policies as any).kill_switch && process.env.AI_KILL === "1") {
    throw new Error("AI_DISABLED");
  }
}
