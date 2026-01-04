import { DefaultState } from "./state";
import { applySignal } from "./signals";
import { optimize } from "./optimizer";
import { execute } from "./executor";

export function runL5() {
  let state = DefaultState;

  // demo signals (replace with real telemetry)
  state = applySignal(state, { fraudPressure: 0.9 });
  state = applySignal(state, { liquidityIndex: 0.5 });

  const actions = optimize(state);
  execute(actions);
}
