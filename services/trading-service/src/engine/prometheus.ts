import type { Request, Response } from "express";
import client from "prom-client";
import { prisma } from "../prisma";

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const jobsGauge = new client.Gauge({
  name: "lumariq_jobs_total",
  help: "Job counts by status",
  labelNames: ["status"],
  registers: [register]
});

const apiKeysGauge = new client.Gauge({
  name: "lumariq_active_apikeys",
  help: "Active API keys",
  registers: [register]
});

const rateHitsGauge = new client.Gauge({
  name: "lumariq_ratehits_total",
  help: "Total rows in ApiKeyUsage (rough rate-hit counter)",
  registers: [register]
});

let lastUpdate = 0;

export async function refreshBusinessMetrics() {
  const now = Date.now();
  // throttle refresh to avoid hammering DB if spammed
  if (now - lastUpdate < 1500) return;
  lastUpdate = now;

  const [pending, running, done, failed, dlq, apiKeys, rateHits] = await Promise.all([
    prisma.matchJob.count({ where: { status: "PENDING" } }),
    prisma.matchJob.count({ where: { status: "RUNNING" } }),
    prisma.matchJob.count({ where: { status: "DONE" } }),
    prisma.matchJob.count({ where: { status: "FAILED" } }),
    prisma.matchJob.count({ where: { deadAt: { not: null } } }),
    prisma.apiKey.count({ where: { active: true } }),
    prisma.apiKeyUsage.count()
  ]);

  jobsGauge.set({ status: "PENDING" }, pending);
  jobsGauge.set({ status: "RUNNING" }, running);
  jobsGauge.set({ status: "DONE" }, done);
  jobsGauge.set({ status: "FAILED" }, failed);
  jobsGauge.set({ status: "DLQ" }, dlq);

  apiKeysGauge.set(apiKeys);
  rateHitsGauge.set(rateHits);
}

export async function prometheusMetrics(req: Request, res: Response) {
  await refreshBusinessMetrics();
  res.setHeader("Content-Type", register.contentType);
  res.send(await register.metrics());
}

/**
 * Minimal Grafana dashboard JSON you can import (Datasource: Prometheus)
 * This is a starter; you’ll likely customize.
 */
export function grafanaDashboard(_req: Request, res: Response) {
  res.json({
    title: "Lumariq Trading — Core",
    timezone: "browser",
    schemaVersion: 39,
    version: 1,
    refresh: "10s",
    panels: [
      {
        type: "timeseries",
        title: "Jobs by status",
        targets: [
          { expr: 'lumariq_jobs_total{status="PENDING"}', legendFormat: "PENDING" },
          { expr: 'lumariq_jobs_total{status="RUNNING"}', legendFormat: "RUNNING" },
          { expr: 'lumariq_jobs_total{status="DONE"}', legendFormat: "DONE" },
          { expr: 'lumariq_jobs_total{status="FAILED"}', legendFormat: "FAILED" },
          { expr: 'lumariq_jobs_total{status="DLQ"}', legendFormat: "DLQ" }
        ]
      },
      {
        type: "stat",
        title: "Active API Keys",
        targets: [{ expr: "lumariq_active_apikeys" }]
      },
      {
        type: "stat",
        title: "Rate Hit Rows",
        targets: [{ expr: "lumariq_ratehits_total" }]
      }
    ]
  });
}
