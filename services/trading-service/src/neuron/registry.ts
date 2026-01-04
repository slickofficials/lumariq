export type NeuronFunction = {
  id: string;
  name: string;

  /* classification */
  layer: "L0" | "L1" | "L2" | "L3";
  category?: "core" | "agent" | "tool" | "external";

  /* lifecycle */
  status: "ACTIVE" | "disabled" | "beta";

  /* metadata */
  description?: string;
  tags?: string[];
};

const REGISTRY = new Map<string, NeuronFunction>();

export function registerFunction(fn: NeuronFunction) {
  REGISTRY.set(fn.id, fn);
  return fn;
}

export function getFunction(id: string) {
  return REGISTRY.get(id);
}

export function listFunctions() {
  return Array.from(REGISTRY.values());
}

export const FUNCTION_REGISTRY = REGISTRY;
