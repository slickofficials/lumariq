import amqp from "amqplib";
import { matchOrder } from "./matcher";

export async function startConsumer() {
  const url = process.env.RABBITMQ_URL || "amq://localhost";
  const conn = await amqp.connect(url);
  const channel = await conn.createChannel();
  await channel.assertQueue("wallet.orders");

  console.log("📥 [trading] Consumer waiting on wallet.orders...");

  channel.consume("wallet.orders", async msg => {
    if (!msg) return;
    const order = JSON.parse(msg.content.toString());
    console.log("📥 [trading] Received order:", order);

    try {
      await matchOrder(order);
      channel.ack(msg);
    } catch (err) {
      console.error("❌ Match error:", err);
      // optional: channel.nack(msg, false, false);
      channel.ack(msg);
    }
  });
}
