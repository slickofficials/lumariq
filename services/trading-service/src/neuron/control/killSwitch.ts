/**
 * Kill-switch is the absolute authority.
 * If enabled, ALL automation/agents/engine actions must no-op.
 */
let KILL_SWITCH = false;

export function enableKillSwitch(reason = "manual") {
  KILL_SWITCH = true;
  console.log("🛑 KILL SWITCH ENABLED:", reason);
}

export function disableKillSwitch(reason = "manual") {
  KILL_SWITCH = false;
  console.log("✅ KILL SWITCH DISABLED:", reason);
}

export function isKillSwitchEnabled() {
  return KILL_SWITCH;
}
