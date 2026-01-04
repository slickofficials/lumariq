import { Queue } from "bullmq";
import { redis } from "../infra/redis";

export const neuronQueue = new Queue("neuron-jobs", {
  connection: redis,
});

export async function enqueueNeuronJob(name: string, data: any, opts: any = {}) {
  return neuronQueue.add(name, data, opts);
}
