import { SystemState } from "./state";

export function applySignal(
  state: SystemState,
  signal: Partial<SystemState>
): SystemState {
  return {
    ...state,
    ...signal
  };
}
