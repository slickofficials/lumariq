import { NeuronRunner } from "./types";

export const runners: Record<string, NeuronRunner> = {
  echo: async (payload) => ({ echo: payload })
};
