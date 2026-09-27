type SetCall =
  | { kind: "value"; value: number } // setCount(5)
  | { kind: "snapshotPlus"; delta: number } // setCount(count + delta)
  | { kind: "updaterPlus"; delta: number } // setCount(c => c + delta)
  | { kind: "updaterTimes"; factor: number }; // setCount(c => c * factor)

// One click handler runs during a render where `count === snapshot`. It makes
// the setCount calls in `calls`, in order, then runs console.log(count).
// Return { logged, next }:
// - logged: what console.log(count) prints inside the handler
// - next:   the count React renders next, after replaying the queued updates
// Remember: `count` never changes inside one render, but an updater function
// receives the result of the previous queued update.
export function runHandler(snapshot: number, calls: SetCall[]) {
  // This treats every call as if `count` updated immediately. It does not.
  let count = snapshot;
  for (const call of calls) {
    if (call.kind === "value") count = call.value;
    else if (call.kind === "updaterTimes") count = count * call.factor;
    else count = count + call.delta;
  }
  return { logged: count, next: count };
}
