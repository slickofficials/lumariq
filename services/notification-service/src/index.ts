import express from "express";
import dotenv from "dotenv";
import { consumeNotifications } from "./queue";

dotenv.config();
const app = express();
app.use(express.json());

app.get("/health", (_req, res) =>
  res.json({ service: "notification-service", status: "ok" })
);

consumeNotifications();

const port = process.env.PORT || 4300;
app.listen(port, () => {
  console.log(`Notification service running on port ${port}`);
});