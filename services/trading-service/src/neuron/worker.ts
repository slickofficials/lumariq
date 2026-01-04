import { resetDailyUsage } from "./dailyReset";
setInterval(resetDailyUsage, 24 * 60 * 60 * 1000);

import { markPaid } from "../analytics/redis";
import { redis } from "../infra/redis";import { dispatchFunction } from "./dispatch";
import "./expiryCron";



async function loop() {
  console.log("🧠 NEURON WORKER ONLINE");

  while (true) {
    const res = await redis.brpop("neuron:queue", 0);
    if (!res) continue;

    const { id, job } = JSON.parse(res[1]);
    try {
      const result = await dispatchFunction(
        job.functionId,
        job.payload,
        job.country
      );
      await redis.set(`neuron:result:${id}`, JSON.stringify(result));
    } catch (e:any) {
      await redis.set(`neuron:result:${id}`, JSON.stringify({ error: e.message }));
    }
  }
}

loop();
