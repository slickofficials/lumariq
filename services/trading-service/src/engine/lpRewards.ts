import { prisma } from "../prisma";

export async function updateLPRewards(providerId: number) {
  const provider = await prisma.liquidityProvider.findUnique({ 
    where: { id: providerId },
    include: { pool: true }
  });
  if (!provider) return;

  const state = await prisma.poolFeeState.findUnique({ 
    where: { poolId: provider.poolId }
  });
  if (!state) return;

  let reward = await prisma.lPRewardPosition.findUnique({ 
    where: { providerId }
  });

  if (!reward) {
    reward = await prisma.lPRewardPosition.create({
      data: { providerId }
    });
  }

  const accumulated =
    provider.shares * state.accFeePerShare;

  const pending = accumulated - reward.rewardDebt;

  await prisma.lPRewardPosition.update({
    where: { providerId },
    data: {
      pendingFees: reward.pendingFees + pending,
      rewardDebt: accumulated
    }
  });
}
