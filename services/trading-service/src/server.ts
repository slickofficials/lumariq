import express from "express";
import { startConsumer } from "./rabbit";
import { connectSettlementPublisher } from "./settlement";
import { getSystemMetrics } from "./engine/metrics";
import { canary } from "./middleware/canary";
import { trustHeaders } from "./middleware/trustHeaders";

function pick(mod: any, names: string[]) {
  for (const n of names) if (mod?.[n]) return mod[n];
  return mod?.default || mod;
}

const PORT = Number(process.env.PORT || 4003);
const app = express();

app.use(express.json());
app.use(trustHeaders);
app.use(canary);

// ---- Middleware (export-safe) ----
const apiKeyMod = require("./middleware/apiKey");
const requireApiKey = pick(apiKeyMod, ["requireApiKey", "apiKeyMiddleware"]);

const rateMod = require("./middleware/rateLimit");
const rateLimit = pick(rateMod, ["rateLimit", "apiLimiter", "limiter"]);

// ---- Routers (export-safe) ----
const matchQueueMod = require("./routes/matchQueue");
const matchQueueRouter = pick(matchQueueMod, ["matchQueueRouter", "matchQueueRoutes", "router"]);

const adminSecurityMod = require("./routes/adminSecurity");
const adminSecurityRouter = pick(adminSecurityMod, ["adminSecurityRoutes", "adminSecurityRouter", "router"]);

const adminControlMod = require("./routes/adminControl");
const adminControlRouter = pick(adminControlMod, ["adminControlRoutes", "router"]);

// ---- Always-available health ----
app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ---- Core mounts ----
if (typeof matchQueueRouter === "function") {
  app.use("/match-queue", requireApiKey, rateLimit, matchQueueRouter);
} else {
  console.warn("⚠️ matchQueueRouter not a router; /match-queue disabled");
}

if (typeof adminSecurityRouter === "function") {
  app.use("/admin/security", requireApiKey, adminSecurityRouter);
} else {
  console.warn("⚠️ adminSecurityRouter not a router; /admin/security disabled");
}

if (typeof adminControlRouter === "function") {
  app.use("/admin/control", requireApiKey, adminControlRouter);
} else {
  console.warn("⚠️ adminControlRouter not a router; /admin/control disabled");
}

// ---- Metrics (Phase 48) ----
app.get("/admin/metrics", requireApiKey, async (_req, res) => {
  res.json(await getSystemMetrics());
});

async function start() {
  try {
    console.log("🔥 Trading Service starting...");
    await startConsumer();
    await connectSettlementPublisher();

    app.listen(PORT, () => {
      console.log(`🔥 Trading Service running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Trading Service failed to start:", err);
  }
}

start();
