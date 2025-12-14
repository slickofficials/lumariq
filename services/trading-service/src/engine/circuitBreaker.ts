let halted = false;
let lastPrice: number | null = null;

const VOLATILITY_THRESHOLD = 0.15; // 15%

export function checkCircuitBreaker(price: number) {
  if (lastPrice) {
    const delta = Math.abs(price - lastPrice) / lastPrice;
    if (delta > VOLATILITY_THRESHOLD) {
      halted = true;
      throw new Error("Trading halted due to extreme volatility");
    }
  }
  lastPrice = price;
}

export function assertTradingActive() {
  if (halted) {
    throw new Error("Trading currently halted by circuit breaker");
  }
}

export function resetCircuitBreaker() {
  halted = false;
  lastPrice = null;
}
