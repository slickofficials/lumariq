import { resetCircuitBreaker, assertTradingActive } from "./circuitBreaker";
import { getSystemMetrics } from "./metrics";

let maintenanceMode = false;
let maintenanceReason: string | null = null;

export function enableMaintenanceMode(reason?: string) {
  maintenanceMode = true;
  maintenanceReason = reason ?? "manual-maintenance";
}

export function disableMaintenanceMode() {
  maintenanceMode = false;
  maintenanceReason = null;
  // when coming back, we also clear the circuit breaker state
  resetCircuitBreaker();
}

export function isMaintenanceMode() {
  return maintenanceMode;
}

export function getMaintenanceReason() {
  return maintenanceReason;
}

/**
 * Gate trading for non-admin users.
 * You can call this in routes or matchers before executing trades.
 */
export function assertTradingAllowed(isAdmin: boolean) {
  if (maintenanceMode && !isAdmin) {
    throw new Error(
      maintenanceReason
        ? `Trading disabled: ${maintenanceReason}`
        : "Trading disabled for maintenance"
    );
  }

  // also ensure circuit breaker didn’t halt
  assertTradingActive();
}

/**
 * Snapshot useful admin-level status:
 * - maintenance flag
 * - maintenance reason
 * - basic metrics
 */
export function getAdminStatus() {
  return {
    maintenanceMode,
    maintenanceReason,
    metrics: getSystemMetrics(),
  };
}
