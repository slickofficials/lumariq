export function getAmountOut(
  amountIn: number,
  reserveIn: number,
  reserveOut: number,
  feeBps: number
) {
  if (amountIn <= 0) throw new Error("amountIn must be positive");
  if (reserveIn <= 0 || reserveOut <= 0) throw new Error("Insufficient liquidity");

  const feeMultiplier = 10000 - feeBps;
  const amountInWithFee = amountIn * feeMultiplier;

  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn * 10000 + amountInWithFee;

  return numerator / denominator;
}

export function assertSlippage(
  amountOut: number,
  minAmountOut?: number
) {
  if (minAmountOut != null && amountOut < minAmountOut) {
    throw new Error("Slippage limit exceeded");
  }
}
