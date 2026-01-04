import { prisma } from "./prisma";
import { publishWalletEvent } from "./rabbit";

export async function handleOrderCompleted(msg: {
  orderId: number;
  userId: number;
  amount: number;
}) {
  const { orderId, userId, amount } = msg;

  console.log("[wallet-service] Processing order.completed:", msg);

  let wallet = await prisma.wallet.findUnique({ where: { userId } });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { userId, balance: 0 },
    });
  }

  const existing = await prisma.transaction.findFirst({
    where: { refId: String(orderId), type: "CREDIT" },
  });

  if (existing) return;

  const updated = await prisma.$transaction(async (tx) => {
    await tx.transaction.create({
      data: {
        walletId: wallet!.id,
        amount,
        type: "CREDIT",
        refId: String(orderId),
      },
    });

    return tx.wallet.update({
      where: { id: wallet!.id },
      data: { balance: wallet.balance + amount },
    });
  });

  publishWalletEvent("wallet.credited", {
    userId,
    amount,
    newBalance: updated.balance,
  });

  console.log("[wallet-service] Wallet updated:", updated);
  return updated;
}
