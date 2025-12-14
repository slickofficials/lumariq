export function assertSlippage({
  expectedPrice,
  executionPrice,
  maxSlippageBps = 100
}: {
  expectedPrice: number;
  executionPrice: number;
  maxSlippageBps?: number;
}) {
  const slip = Math.abs(expectedPrice - executionPrice) / expectedPrice;
  const bps = slip * 10_000;

  if (bps > maxSlippageBps) {
    throw new Error("Slippage limit exceeded");
  }
}
