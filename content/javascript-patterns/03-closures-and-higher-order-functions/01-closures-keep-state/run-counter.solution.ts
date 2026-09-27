function makeCounter(start: number) {
  let count = start;
  return {
    increment: () => ++count,
    decrement: () => --count,
    reset: () => (count = start),
  };
}

export function runCounter(start: number, ops: string[]): number[] {
  const counter = makeCounter(start);
  return ops.map((op) => {
    if (op === "inc") return counter.increment();
    if (op === "dec") return counter.decrement();
    return counter.reset();
  });
}
