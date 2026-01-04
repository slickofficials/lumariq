import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import riskRoutes from "./routes/risk.routes";

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ ok: true }));

// register routes
app.use("/risk", riskRoutes);

export default app;
