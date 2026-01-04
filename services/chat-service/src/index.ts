import express from "express";
import { registerChatRoutes } from "./routes/chat.routes";

const app = express();
app.use(express.json());

registerChatRoutes(app);

app.get("/health", (_, res) => res.json({ status: "chat-service ok" }));

app.listen(4020, () => {
  console.log("💬 chat-service running on :4020");
});
