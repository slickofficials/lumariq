import amqp from "amqplib";
import pino from "pino";

const logger = pino({ transport: { target: "pino-pretty" } });

export async function consumeNotifications() {
  try {
    const conn = await amqp.connect(`amqp://${process.env.RABBITMQ_HOST}`);
    const channel = await conn.createChannel();

    const queue = "notifications";
    await channel.assertQueue(queue, { durable: true });

    logger.info("[Notification Service] Waiting for messages…");

    channel.consume(queue, async (msg) => {
      if (!msg) return;
      const payload = JSON.parse(msg.content.toString());

      logger.info("Received:", payload);

      // TODO: connect real SMS/email provider here
      logger.info("✔ Notification processed");

      channel.ack(msg);
    });
  } catch (err) {
    logger.error("Queue connection error:", err);
  }
}