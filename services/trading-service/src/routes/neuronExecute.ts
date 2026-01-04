import { redis } from "../infra/redis";
import { Queue } from "bullmq";
import { initJob } from "../neuron/jobStore";

const queue = new Queue("neuron-exec", {
  connection: redis
});

export async function neuronExecute(req: any, res: any) {
  const { functionId, payload } = req.body;

  const job = await queue.add("exec", { functionId, payload });

  await initJob(job.id!.toString(), functionId);

  res.json({
    status: "QUEUED",
    jobId: job.id
  });
}
