type Transition = { from: string; event: string; to: string };
type Machine = { initial: string; final?: string[]; transitions: Transition[] };

export function runMachine(machine: Machine, events: string[]) {
  // Start in machine.initial with history [initial].
  // For each event:
  //   - in a final state, every event is rejected
  //   - otherwise use the first transition with from === state and this event;
  //     only if there is none, the first with from === "*" and this event
  //   - no transition: push "<event>@<state>" to rejected and stay put
  //   - a transition: move to `to` and push it to history (even if unchanged)
  // Return { state, history, rejected }.
}
