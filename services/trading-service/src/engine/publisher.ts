import amqp from "amqplib";

let channel: amqp.Channel | null = null;

export async function connectPublisher() {
  const url = process.env.RABBITMQ_URL || "amqp://localhost";
  const conn = await amqp.connect(url);
  channel = await conn.createChannel();
  await channel.assertQueue("trading.orders");
  console.log("📤 [trading] Publisher connected");
}

export async function publishOrder(order: any) {
  if (!channel) throw new Error("Publisher channel not initialized");
  channel.sendToQueue("trading.orders", Buffer.from(JSON.stringify(order)));
}
