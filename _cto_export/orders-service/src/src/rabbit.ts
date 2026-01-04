// src/rabbit.ts
import amqp, { Channel } from "amqplib";

let channel: Channel | null = null;
let connection: any | null = null;

const EXCHANGE_NAME = "orders";

export async function initRabbit(): Promise<void> {
  const url = process.env.RABBITMQ_URL || "amqp://localhost";

  connection = await amqp.connect(url);
  // We don’t over-type this, let TS infer it from amqplib
  channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE_NAME, "topic", {
    durable: true,
  });

  console.log(
    "[orders-service] ✅ Connected to RabbitMQ, exchange:",
    EXCHANGE_NAME
  );
}

export async function publishOrderEvent(
  routingKey: string,
  payload: unknown
): Promise<void> {
  if (!channel) {
    console.warn(
      "[orders-service] ⚠️ publishOrderEvent called before initRabbit; skipping"
    );
    return;
  }

  const body = Buffer.from(JSON.stringify(payload));

  channel.publish(EXCHANGE_NAME, routingKey, body, {
    persistent: true,
    contentType: "application/json",
  });
}

export async function closeRabbit(): Promise<void> {
  try {
    if (channel) {
      await channel.close();
    }
    if (connection) {
      await connection.close();
    }
  } catch (err) {
    console.error("[orders-service] ⚠️ Error closing RabbitMQ connection", err);
  } finally {
    channel = null;
    connection = null;
  }
}