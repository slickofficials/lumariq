import { prisma } from "./prisma";

type Severity = "LOW" | "MEDIUM" | "HIGH";

export async function evaluateWalletRisk(userId: number) {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  const transactions = await prisma.transaction.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  let score = 0;
  const reasons: string[] = [];

  // 💰 High single transaction
  const highTx = transactions.find((t) => t.amount >= 5000);
  if (highTx) {
    score += 30;
    reasons.push("High single transaction (>= 5000)");
  }

  // ⚡ Velocity in last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const txLastHour = transactions.filter((t) => t.createdAt > oneHourAgo);
  const sumLastHour = txLastHour.reduce((a, b) => a + b.amount, 0);

  if (sumLastHour > 8000) {
    score += 30;
    reasons.push("High hourly volume (> 8000)");
  }

  if (txLastHour.length >= 10) {
    score += 15;
    reasons.push("High transaction count in last hour (>= 10)");
  }

  // 🆕 New wallet with activity
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (wallet.createdAt > dayAgo && transactions.length > 0) {
    score += 10;
    reasons.push("New wallet with early activity");
  }

  const boundedScore = Math.min(100, score);

  let severity: Severity = "LOW";
  if (boundedScore >= 70) severity = "HIGH";
  else if (boundedScore >= 30) severity = "MEDIUM";

  // 🎯 Suggested daily limit
  let suggestedDailyLimit = 5000;
  if (severity === "MEDIUM") suggestedDailyLimit = 2500;
  if (severity === "HIGH") suggestedDailyLimit = 1000;

  const updatedWallet = await prisma.wallet.update({
    where: { id: wallet.id },
    data: {
      riskScore: boundedScore,
      dailyLimit: suggestedDailyLimit,
    },
  });

  // 🚩 Persist flag if risky
  if (severity !== "LOW") {
    await prisma.walletFlag.create({
      data: {
        walletId: wallet.id,  // FIXED
        code: severity === "HIGH" ? "HIGH_RISK" : "MEDIUM_RISK",
        severity,
        message: reasons.join("; ") || "Risky wallet activity detected",
        reason: reasons.join("; ") || "Risky wallet activity detected", // required field
      },
    });
  }

  return {
    wallet: updatedWallet,
    score: boundedScore,
    severity,
    suggestedDailyLimit,
    reasons,
  };
}

export async function getWalletRisk(userId: number) {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    include: {
      flags: {
        where: { resolved: false },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  return wallet;
}

export async function resolveWalletFlag(flagId: number) {
  return prisma.walletFlag.update({
    where: { id: flagId },
    data: { resolved: true },
  });
}