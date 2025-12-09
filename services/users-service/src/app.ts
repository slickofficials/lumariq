import express from "express";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes";
import { corsMiddleware, helmetMiddleware } from "./middleware/securityHeaders";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

app.disable("x-powered-by");

// Core parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

// Logging chain
app.use(morgan("combined"));
app.use(requestLogger);

// Security middlewares
app.use(helmetMiddleware);
app.use(corsMiddleware);

// Routes
app.use("/auth", authRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "users-service ok" });
});

// 404 + error handler
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
