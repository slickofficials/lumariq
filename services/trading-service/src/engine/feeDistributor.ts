import { prisma } from "../prisma";

export async function distributeSwapFee(
  poolId: number,
  feeAmount: number
) {
  if (feeAmount <= 0) return;

  const pool = await prisma.liquidityPool.findUnique({ include: { providers: true }, 
    where: { id: poolId }
  });
  if (!pool || pool.totalShares <= 0) return;

  let state = await prisma.poolFeeState.findUnique({  
    where: { poolId }
  });

  if (!state) {
    state = await prisma.poolFeeState.create({
      data: { poolId }
    });
  }

  const feePerShare = feeAmount / pool.totalShares;

  await prisma.poolFeeState.update({
    where: { poolId },
    data: {
      accFeePerShare: state.accFeePerShare + feePerShare,
      totalFees: state.totalFees + feeAmount
    }
  });
}
