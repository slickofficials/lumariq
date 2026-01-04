let tradingPaused = false;

export function pauseTrading() {
  tradingPaused = true;
}

export function resumeTrading() {
  tradingPaused = false;
}

export function isTradingPaused() {
  return tradingPaused;
}
