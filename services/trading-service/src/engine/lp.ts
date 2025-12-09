export function calculateShares(
  amountA: number,
  amountB: number,
  pool: { reserveA: number; reserveB: number; totalShares: number }
) {
  if (amountA <= 0 || amountB <= 0) {
    throw new Error("Amounts must be positive");
  }

  if (pool.totalShares === 0) {
    return Math.sqrt(amountA * amountB);
  }

  const sharesFromA = (amountA * pool.totalShares) / pool.reserveA;
  const sharesFromB = (amountB * pool.totalShares) / pool.reserveB;

  return Math.min(sharesFromA, sharesFromB);
}

export function calculateWithdraw(
  shares: number,
  pool: { reserveA: number; reserveB: number; totalShares: number }
) {
  if (shares <= 0) throw new Error("Shares must be positive");
  if (shares > pool.totalShares) throw new Error("Shares exceed total supply");

  const ratio = shares / pool.totalShares;

  return {
    amountA: pool.reserveA * ratio,
    amountB: pool.reserveB * ratio
  };
}

export function assertSlippage(
  expected: number,
  actual: number,
  maxSlippage = 0.01
) {
  if (expected <= 0) return;
  const slippage = Math.abs(actual - expected) / expected;
  if (slippage > maxSlippage) {
    throw new Error("Slippage exceeded");
  }
}
