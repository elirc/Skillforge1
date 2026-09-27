type Transition = { from: string; event: string; to: string };
type Machine = { initial: string; final?: string[]; transitions: Transition[] };
type Run = { state: string; history: string[]; rejected: string[] };

export function runMachine(machine: Machine, events: string[]): Run {
  const finals = new Set(machine.final ?? []);
  let state = machine.initial;
  const history = [state];
  const rejected: string[] = [];

  for (const event of events) {
    const next = finals.has(state)
      ? undefined
      : (machine.transitions.find((t) => t.from === state && t.event === event) ??
        machine.transitions.find((t) => t.from === "*" && t.event === event));

    if (next === undefined) {
      rejected.push(`${event}@${state}`);
      continue;
    }
    state = next.to;
    history.push(state);
  }

  return { state, history, rejected };
}
