import { prisma } from "../prisma";
import { recordEngineEvent } from "./observability";

async function ensureWallet(userId: number) {
  let wallet = await prisma.wallet.findUnique({
    where: { userId }
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { userId, balance: 0 }
    });
  }

  return wallet;
}

export async function settleTrade({
  buyerId,
  sellerId,
  poolId,
  amountIn,
  amountOut,
  fee
}: {
  buyerId: number;
  sellerId: number;
  poolId: number;
  amountIn: number;
  amountOut: number;
  fee: number;
}) {
  // 🔐 Ensure wallets exist
  const buyerWallet = await ensureWallet(buyerId);
  const sellerWallet = await ensureWallet(sellerId);

  // 🚫 Guard: buyer must have enough balance
  if (buyerWallet.balance < amountIn) {
    throw new Error("Insufficient balance for settlement");
  }

  // 💸 Debit buyer
  const updatedBuyer = await prisma.wallet.update({
    where: { userId: buyerId },
    data: {
      balance: { decrement: amountIn }
    }
  });

  // 🚫 Guard: never allow negative balances
  if (updatedBuyer.balance < 0) {
    throw new Error("Negative balance invariant violated for buyer");
  }

  // 💰 Credit seller
  const updatedSeller = await prisma.wallet.update({
    where: { userId: sellerId },
    data: {
      balance: { increment: amountOut }
    }
  });

  // 🧮 Fee bucket (ensure PoolFeeState exists)
  await prisma.poolFeeState.upsert({
    where: { poolId },
    update: { totalFees: { increment: fee } },
    create: {
      poolId,
      accFeePerShare: 0,
      totalFees: fee
    }
  });

  // 👀 Observability
  await recordEngineEvent({
    type: "trade.settlement",
    context: "settleTrade",
    payload: {
      buyerId,
      sellerId,
      poolId,
      amountIn,
      amountOut,
      fee,
      buyerBalanceAfter: updatedBuyer.balance,
      sellerBalanceAfter: updatedSeller.balance
    }
  });

  return true;
}
