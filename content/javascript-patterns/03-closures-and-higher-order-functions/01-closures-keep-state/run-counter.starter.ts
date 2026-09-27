function makeCounter(start: number) {
  // Keep a private `count` variable here (start it at `start`), and have each
  // returned function update it and return the new value.
  return {
    increment: () => start,
    decrement: () => start,
    reset: () => start,
  };
}

export function runCounter(start: number, ops: string[]): number[] {
  const counter = makeCounter(start);
  // For each op ("inc" | "dec" | "reset"), call the matching counter function
  // and collect the value it returns.
  return ops.map(() => counter.increment());
}
