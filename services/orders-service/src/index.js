"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const rabbit_1 = require("./rabbit");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: "5mb" }));
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("combined"));
// health
app.get("/", (_, res) => res.json({ service: "orders-service", status: "ok" }));
app.use("/", routes_1.default);
// global err
app.use((err, _req, res, _next) => {
    console.error("ORDERS ERROR:", err);
    res.status(500).json({ error: "internal_error" });
});
const port = Number(process.env.ORDERS_PORT || 4000);
app.listen(port, async () => {
    await (0, rabbit_1.initRabbit)();
    console.log(`Orders service running on :${port}`);
});
