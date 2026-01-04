import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  socket.on("join", (room) => socket.join(room));
  socket.on("message", (msg) => io.to(msg.room).emit("message", msg));
});

app.get("/health", (_req, res) => {
  res.json({ status: "chat-service ok" });
});

export { server };
