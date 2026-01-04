import { prisma } from "./prisma";
import { publishWalletEvent } from "./rabbit";

/**
 * 🔒 Freeze wallet
 */
export async function freezeWallet(userId: number) {
  return prisma.wallet.update({
    where: { userId },
    data: { frozen: true },
  });
}

/**
 * 🔓 Unfreeze wallet
 */
export async function unfreezeWallet(userId: number) {
  return prisma.wallet.update({
    where: { userId },
    data: { frozen: false },
  });
}

/**
 * 🛑 Anti-fraud velocity checks
 */
export async function checkFraud(userId: number, amount: number) {
  const lastTx = await prisma.transaction.findMany({
    where: { wallet: { userId } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const totalLastMinute = lastTx
    .filter((t) => Date.now() - t.createdAt.getTime() < 60_000)
    .reduce((a, b) => a + b.amount, 0);

  if (amount > 5000) return "HIGH_AMOUNT";
  if (totalLastMinute > 8000) return "VELOCITY";
  return "OK";
}

/**
 * 💸 Withdraw + lock balance
 */
export async function withdraw(userId: number, amount: number, refId?: string) {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) throw new Error("Wallet not found");
  if (wallet.frozen) throw new Error("Wallet frozen");
  if (wallet.balance < amount) throw new Error("Insufficient balance");

  const fraud = await checkFraud(userId, amount);
  if (fraud !== "OK") {
    publishWalletEvent("wallet.fraud_detected", { userId, reason: fraud });
    throw new Error("Potential fraud detected: " + fraud);
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        amount,
        type: "DEBIT",
        refId,
      },
    });

    return tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: wallet.balance - amount },
    });
  });

  publishWalletEvent("wallet.withdrawn", {
    userId,
    amount,
    newBalance: updated.balance,
    refId,
  });

  return updated;
}
