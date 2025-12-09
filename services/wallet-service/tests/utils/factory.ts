import { prisma } from "../../src/prisma";

export async function randomUserId() {
  return Math.floor(Math.random() * 900000) + 100000;
}

export async function createWallet(userId?: number) {
  return prisma.wallet.create({
    data: {
      userId: userId ?? await randomUserId(),
      balance: 1000,
      currency: "USD"
    }
  });
}

export async function createFlag(walletId: number) {
  return prisma.walletFlag.create({
    data: {
      walletId,
      code: "HIGH_RISK",
      severity: "HIGH",
      reason: "Auto-test flag",
      message: "Auto-test flag",
      resolved: false
    }
  });
}
