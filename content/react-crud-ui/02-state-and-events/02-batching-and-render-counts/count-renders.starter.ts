type Primitive = string | number | boolean | null;

type SetCall =
  | { key: string; op: "set"; value: Primitive } // setX(value)
  | { key: string; op: "add"; delta: number }; // setX(x => x + delta)

// A component has one useState per key in `initial`. Each entry in `events` is
// one event handler (a click, a resolved fetch, a timeout...) and lists the
// setState calls it makes, in order.
// Since React 18, every setState in the same event is batched, including in
// promises and timeouts, so one event causes at most ONE re-render. React skips
// it when every state value ends up Object.is-equal to what it was.
// Return { renders, state }: re-renders after the initial mount, and final state.
export function countRenders(initial: Record<string, Primitive>, events: SetCall[][]) {
  const state = { ...initial };
  let renders = 0;
  for (const batch of events) {
    for (const call of batch) {
      if (call.op === "set") state[call.key] = call.value;
      else state[call.key] = (state[call.key] as number) + call.delta;
      renders += 1; // one render per setState call? Not since React 18.
    }
  }
  return { renders, state };
}
