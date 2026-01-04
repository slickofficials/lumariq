import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import crypto from "crypto";
import { setupStreamRoutes } from "./stream";
import { setupAdminRoutes } from "./adminRoutes";
import { processSurgeSignal } from "./shockWorker";

const app = express();
app.use(cors());

// Custom middleware to capture RAW body for HMAC verification
app.use('/internal', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use('/dashboard', express.static('public'));

const SHARED_SECRET = process.env.INTERNAL_SHARED_SECRET || "fallback_secret";

app.post("/internal/surge-report", async (req, res) => {
  const signature = req.headers['x-lumariq-signature'];
  const rawBody = req.body.toString(); // The exact bytes from the wire
  
  const expectedSignature = crypto
    .createHmac("sha256", SHARED_SECRET)
    .update(rawBody)
    .digest("hex");

  if (signature !== expectedSignature) {
    console.log("❌ HMAC MISMATCH");
    return res.status(401).json({ error: "Unauthorized Signature" });
  }

  const { hexId, multiplier } = JSON.parse(rawBody);
  await processSurgeSignal(hexId, multiplier);
  res.status(200).json({ status: "processed" });
});

setupStreamRoutes(app);
setupAdminRoutes(app);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 SECURE NEURON GRID ACTIVE ON PORT ${PORT}`));
