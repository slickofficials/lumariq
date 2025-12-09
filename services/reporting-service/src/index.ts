import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import { CronJob } from "cron";
import pino from "pino";

dotenv.config();
const app = express();

const logger = pino({
  transport: { target: "pino-pretty" }
});

app.get("/health", (_req, res) =>
  res.json({ service: "reporting-service", status: "ok" })
);

async function runDailyReport() {
  try {
    const events = await axios.get("http://analytics-service:4400/events/daily");
    logger.info("Daily analytics:", events.data);

    // TODO: Save as PDF/CSV or email to admins
  } catch (err) {
    logger.error("Report error:", err);
  }
}

new CronJob("0 0 * * *", runDailyReport, null, true, "UTC");

app.listen(process.env.PORT || 4500, () =>
  console.log("Reporting service running")
);