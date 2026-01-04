import { Router } from "express";
import fetch from "http";

const router = Router();

/**
 * POST /whatsapp/incoming
 * Payload example (Twilio / Meta compatible):
 * {
 *   "from": "+2348012345678",
 *   "text": "ai.user_assistant hello"
 * }
 */
router.post("/incoming", async (req, res) => {
  const { from, text } = req.body || {};
  if (!from || !text) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  const [functionId, ...rest] = text.trim().split(" ");
  const payload = { text: rest.join(" ") };

  const body = JSON.stringify({
    functionId,
    email: from,
    country: "NG",
    payload
  });

  const request = fetch.request(
    {
      hostname: "localhost",
      port: process.env.PORT || 4003,
      path: "/neuron/execute",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body)
      }
    },
    (resp) => {
      let data = "";
      resp.on("data", (c) => (data += c));
      resp.on("end", () => {
        res.json({
          whatsapp: true,
          from,
          response: JSON.parse(data)
        });
      });
    }
  );

  request.on("error", (e) => {
    res.status(500).json({ error: "neuron_unreachable", details: String(e) });
  });

  request.write(body);
  request.end();
});

export default router;
