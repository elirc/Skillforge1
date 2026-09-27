type Primitive = string | number | boolean | null;

type SetCall =
  | { key: string; op: "set"; value: Primitive } // setX(value)
  | { key: string; op: "add"; delta: number }; // setX(x => x + delta)

export function countRenders(
  initial: Record<string, Primitive>,
  events: SetCall[][],
): { renders: number; state: Record<string, Primitive> } {
  let state = { ...initial };
  let renders = 0;

  for (const batch of events) {
    // Every setState in one event is batched into a single render.
    const next = { ...state };
    for (const call of batch) {
      next[call.key] = call.op === "set" ? call.value : (next[call.key] as number) + call.delta;
    }
    // React skips the re-render when every state value is Object.is-equal to before.
    const changed = Object.keys(next).some((key) => !Object.is(next[key], state[key]));
    if (changed) renders += 1;
    state = next;
  }

  return { renders, state };
}
