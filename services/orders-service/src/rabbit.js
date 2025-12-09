"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRabbit = initRabbit;
exports.publishOrderEvent = publishOrderEvent;
exports.closeRabbit = closeRabbit;
// src/rabbit.ts
const amqplib_1 = __importDefault(require("amqplib"));
let channel = null;
let connection = null;
const EXCHANGE_NAME = "orders";
async function initRabbit() {
    const url = process.env.RABBITMQ_URL || "amqp://localhost";
    connection = await amqplib_1.default.connect(url);
    // We don’t over-type this, let TS infer it from amqplib
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, "topic", {
        durable: true,
    });
    console.log("[orders-service] ✅ Connected to RabbitMQ, exchange:", EXCHANGE_NAME);
}
async function publishOrderEvent(routingKey, payload) {
    if (!channel) {
        console.warn("[orders-service] ⚠️ publishOrderEvent called before initRabbit; skipping");
        return;
    }
    const body = Buffer.from(JSON.stringify(payload));
    channel.publish(EXCHANGE_NAME, routingKey, body, {
        persistent: true,
        contentType: "application/json",
    });
}
async function closeRabbit() {
    try {
        if (channel) {
            await channel.close();
        }
        if (connection) {
            await connection.close();
        }
    }
    catch (err) {
        console.error("[orders-service] ⚠️ Error closing RabbitMQ connection", err);
    }
    finally {
        channel = null;
        connection = null;
    }
}
