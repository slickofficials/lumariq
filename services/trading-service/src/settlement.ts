import amqp from "amqplib";

let channel: amqp.Channel | null = null;

export async function connectSettlementPublisher() {
  const url = process.env.RABBITMQ_URL;
  if (!url) {
    throw new Error("RABBITMQ_URL not set");
  }

  const conn = await amqp.connect(url);
  channel = await conn.createChannel();
  await channel.assertQueue("wallet.settlements");
  console.log("[trading-service] Settlement publisher → wallet.settlements ready");
}

export function publishSettlement(event: any) {
  if (!channel) {
    console.error("[trading-service] Settlement channel not ready, event dropped:", event);
    return;
  }
  channel.sendToQueue("wallet.settlements", Buffer.from(JSON.stringify(event)));
}
