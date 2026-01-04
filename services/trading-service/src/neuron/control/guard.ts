import { isKillSwitchEnabled } from "./killSwitch";

export function guardedRun(label: string, fn: () => void) {
  if (isKillSwitchEnabled()) {
    console.log(`🛑 BLOCKED BY KILL SWITCH: ${label}`);
    return;
  }
  fn();
}
