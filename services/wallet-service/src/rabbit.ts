import amqp from "amqplib";

let channel: amqp.Channel;

export async function connectRabbit() {
  const conn = await amqp.connect(process.env.RABBITMQ_URL!);
  channel = await conn.createChannel();

  await channel.assertQueue("wallet.orders");
  await channel.assertQueue("wallet.settlements");

  console.log("[wallet-service] RabbitMQ connected");
}

export function publishOrder(order: any) {
  if (!channel) return;
  channel.sendToQueue("wallet.orders", Buffer.from(JSON.stringify(order)));
}

export function publishWalletEvent(event: any) {
  if (!channel) return;
  channel.sendToQueue("wallet.settlements", Buffer.from(JSON.stringify(event)));
}
