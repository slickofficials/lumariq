import express from "express";
import dotenv from "dotenv";
import { Pool } from "pg";
import Redis from "ioredis";
import pino from "pino";

dotenv.config();
const app = express();
app.use(express.json());

const logger = pino({
  transport: { target: "pino-pretty" }
});

export const db = new Pool({
  connectionString: process.env.DATABASE_URL
});

export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT)
});

app.post("/event", async (req, res) => {
  try {
    const { event, userId, metadata } = req.body;

    await db.query(
      "INSERT INTO events(type, user_id, metadata) VALUES($1, $2, $3)",
      [event, userId, metadata ?? {}]
    );

    redis.incr(`analytics:${event}`);

    logger.info("Event logged", req.body);
    return res.json({ ok: true });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: "failed" });
  }
});

app.get("/health", (_req, res) =>
  res.json({ service: "analytics-service", status: "ok" })
);

app.listen(process.env.PORT || 4400, () =>
  console.log("Analytics service ready")
);