import express from "express";
import router from "./routes";
import { startConsumer } from "./rabbit"; // your existing consumer for wallet.orders
import { connectSettlementPublisher } from "./settlement";

const PORT = process.env.PORT || 4003;

const app = express();
app.use(express.json());
app.use("/", router);

async function start() {
  try {
    console.log("🔥 Trading Service starting...");
    // RabbitMQ consumer for wallet.orders (matching engine)
    await startConsumer();
    // RabbitMQ publisher for wallet.settlements (wallet updates)
    await connectSettlementPublisher();

    app.listen(PORT, () => {
      console.log(`🔥 Trading Service running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Trading Service failed to start:", err);
  }
}

start();
