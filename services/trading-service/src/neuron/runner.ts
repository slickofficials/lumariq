import { NeuronRunner } from "./types";

const RUNNERS: Record<string, NeuronRunner> = {};

export function registerRunner(id: string, fn: NeuronRunner) {
  RUNNERS[id] = fn;
}

export function getRunner(id: string): NeuronRunner {
  const fn = RUNNERS[id];
  if (!fn) throw new Error("RUNNER_NOT_FOUND: " + id);
  return fn;
}
