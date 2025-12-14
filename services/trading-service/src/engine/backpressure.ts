import { prisma } from "../prisma";

async function postJson(url: string, payload: any) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Backpressure alert:
 * - Set BACKPRESSURE_PENDING_THRESHOLD=1000 (example)
 * - Set ALERT_WEBHOOK_URL=https://... (optional)
 */
export function startBackpressureMonitor() {
  const threshold = Number(process.env.BACKPRESSURE_PENDING_THRESHOLD || 0);
  if (!threshold) return;

  const url = (process.env.ALERT_WEBHOOK_URL || "").trim();

  const intervalMs = Number(process.env.BACKPRESSURE_POLL_MS || 15000);

  setInterval(async () => {
    try {
      const pending = await prisma.matchJob.count({ where: { status: "PENDING" } });
      if (pending >= threshold) {
        const payload = {
          service: "trading-service",
          type: "BACKPRESSURE",
          pending,
          threshold,
          at: new Date().toISOString()
        };
        console.warn("⚠️ BACKPRESSURE:", payload);

        if (url) {
          await postJson(url, payload);
        }
      }
    } catch (e) {
      console.warn("⚠️ Backpressure monitor error:", e);
    }
  }, intervalMs).unref();
}
