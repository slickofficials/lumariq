import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import router from "./routes";
import { initRabbit } from "./rabbit";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("combined"));

app.get("/health", (_, res) => res.json({ service: "kyc-service", status: "ok" }));

app.use("/", router);

const port = process.env.KYC_PORT || 4100;

app.listen(port, async () => {
  await initRabbit();
  console.log(`KYC Service running on :${port}`);
});