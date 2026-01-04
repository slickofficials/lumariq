import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import router from "./routes";
import { initRabbit } from "./rabbit";
import { prisma } from "./prisma";

dotenv.config();

const app = express();
app.use(express.json({ limit: "5mb" }));
app.use(cors());
app.use(helmet());
app.use(morgan("combined"));

// health
app.get("/", (_, res) => res.json({ service: "orders-service", status: "ok" }));

app.use("/", router);

// global err
app.use((err: any, _req: express.Request, res: express.Response, _next: any) => {
  console.error("ORDERS ERROR:", err);
  res.status(500).json({ error: "internal_error" });
});

const port = Number(process.env.ORDERS_PORT || 4000);
app.listen(port, async () => {
  await initRabbit();
  console.log(`Orders service running on :${port}`);
});