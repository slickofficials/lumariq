import express from "express";
import router from "./routes";
import { connectRabbit } from "./rabbit";
import { startSettlementConsumer } from "./settlementConsumer";

const PORT = process.env.PORT || 3002;

const app = express();
app.use(express.json());
app.use("/", router);

async function start() {
  try {
    await connectRabbit();
    await startSettlementConsumer();
    app.listen(PORT, () => {
      console.log(`[wallet-service] listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("[wallet-service] failed to start:", err);
  }
}

start();
