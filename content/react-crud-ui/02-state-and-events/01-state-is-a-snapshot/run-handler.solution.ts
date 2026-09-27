type SetCall =
  | { kind: "value"; value: number } // setCount(5)
  | { kind: "snapshotPlus"; delta: number } // setCount(count + delta)
  | { kind: "updaterPlus"; delta: number } // setCount(c => c + delta)
  | { kind: "updaterTimes"; factor: number }; // setCount(c => c * factor)

export function runHandler(snapshot: number, calls: SetCall[]): { logged: number; next: number } {
  // React queues the calls and replays them in order on the next render.
  let next = snapshot;
  for (const call of calls) {
    switch (call.kind) {
      case "value":
        next = call.value;
        break;
      case "snapshotPlus":
        // `count` is the value from the render that created this handler.
        next = snapshot + call.delta;
        break;
      case "updaterPlus":
        next = next + call.delta;
        break;
      case "updaterTimes":
        next = next * call.factor;
        break;
    }
  }
  // console.log(count) inside the handler still sees this render's snapshot.
  return { logged: snapshot, next };
}
