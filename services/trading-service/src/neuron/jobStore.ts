import { redis } from "../infra/redis";

export type JobStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";

const key = (id: string) => `neuron:job:${id}`;

export async function initJob(id: string, functionId: string) {
  await redis.hset(key(id), {
    status: "QUEUED",
    functionId,
    createdAt: Date.now().toString()
  });
}

export async function setRunning(id: string) {
  await redis.hset(key(id), {
    status: "RUNNING",
    startedAt: Date.now().toString()
  });
}

export async function setCompleted(id: string, result: any) {
  await redis.hset(key(id), {
    status: "COMPLETED",
    finishedAt: Date.now().toString(),
    result: JSON.stringify(result)
  });
}

export async function setFailed(id: string, error: string) {
  await redis.hset(key(id), {
    status: "FAILED",
    finishedAt: Date.now().toString(),
    error
  });
}

export async function getJob(id: string) {
  const data = await redis.hgetall(key(id));
  if (!data || !data.status) return null;

  return {
    ...data,
    result: data.result ? JSON.parse(data.result) : null
  };
}
