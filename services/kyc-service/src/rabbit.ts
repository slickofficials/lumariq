import amqp from "amqplib";

let channel: amqp.Channel | null = null;

export async function initRabbit() {
  const conn = await amqp.connect(`amqp://${process.env.RABBITMQ_HOST}`);
  channel = await conn.createChannel();
  await channel.assertExchange("kyc.events", "topic", { durable: true });
  console.log("KYC Service connected to RabbitMQ");
}

export function publishKycStatus(userId: string, status: string) {
  if (!channel) return;
  channel.publish(
    "kyc.events",
    "kyc.status",
    Buffer.from(JSON.stringify({ userId, status, ts: Date.now() }))
  );
}