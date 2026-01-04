import amqp from "amqplib";
import { applyReferralReward } from "./referral/referralRewards";

let channel: amqp.Channel;

async function assertQueueWithDLQ(name: string) {
  const dlq = `${name}.dlq`;

  await channel.assertQueue(dlq, { durable: true });
  await channel.assertQueue(name, {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": "",
      "x-dead-letter-routing-key": dlq,
    },
  });
}

export async function connectRabbit() {
  const conn = await amqp.connect(process.env.RABBITMQ_URL!);
  channel = await conn.createChannel();

  await assertQueueWithDLQ("wallet.orders");
  await assertQueueWithDLQ("wallet.settlements");
  await assertQueueWithDLQ("wallet.referrals");

  channel.prefetch(10);

  channel.consume("wallet.referrals", async (msg) => {
    if (!msg) return;

    try {
      const evt = JSON.parse(msg.content.toString());

      if (evt.type === "ride.completed") {
        // translate ride.completed -> referral.reward.eligible (wallet owns the policy boundary)
        const eligible = {
          type: "referral.reward.eligible",
          userId: evt.driverId,  // MVP: reward driver; later: map referral owner
          orderId: evt.rideId,
          source: "dispatch",
        };

        await applyReferralReward(eligible, {
          ledgerHasIdem: async (_key: string) => false, // wire to wallet-ledger /idempotency/{key}
          ledgerCredit: async ({ userId, amountMinor, currency, memo, idempotencyKey }: any) => {
            publishWalletEvent({
              type: "wallet.credit",
              userId,
              amount: amountMinor,
              currency,
              reference: idempotencyKey,
              memo,
            });
            return { ledgerTxId: idempotencyKey };
          },
          emit: async (e: any) => publishWalletEvent(e),
        });
      }

      channel.ack(msg);
    } catch (e) {
      console.error("[wallet-service] referral consume error:", e);
      channel.nack(msg, false, false); // send to DLQ
    }
  });

  console.log("[wallet-service] RabbitMQ connected (DLQ + prefetch)");
}

export function publishOrder(order: any) {
  if (!channel) return;
  channel.sendToQueue("wallet.orders", Buffer.from(JSON.stringify(order)), { persistent: true });
}

export function publishWalletEvent(event: any) {
  if (!channel) return;
  channel.sendToQueue("wallet.settlements", Buffer.from(JSON.stringify(event)), { persistent: true });
}

export function publishReferralEvent(event: any) {
  if (!channel) return;
  channel.sendToQueue("wallet.referrals", Buffer.from(JSON.stringify(event)), { persistent: true });
}
