export type NeuronStatus = "ACTIVE" | "DISABLED" | "BETA";
export type NeuronLayer = "L0" | "L1" | "L2" | "L3";

export interface NeuronFunction {
  id: string;
  name: string;
  description: string;
  layer: NeuronLayer;
  status: NeuronStatus;
  tags: string[];
  agent?: string;
  country?: string;
}

export type NeuronRunner = (payload: any) => Promise<any>;
