import { getJob } from "../neuron/jobStore";

export async function neuronJobStatus(req: any, res: any) {
  const job = await getJob(req.params.jobId);

  if (!job) {
    return res.status(404).json({ error: "JOB_NOT_FOUND" });
  }

  res.json(job);
}
