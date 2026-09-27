type CounterEvent = { type: "tick" } | { type: "click"; add: number };

interface Setup {
  deps: "empty" | "count";
  update: "snapshot" | "updater";
}

export function simulateCounter(
  events: CounterEvent[],
  setup: Setup,
): { count: number; intervalsCreated: number; intervalsCleared: number } {
  let count = 0;
  let captured = 0; // the `count` the current interval callback closed over
  let intervalsCreated = 1; // the effect runs once on mount
  let intervalsCleared = 0;

  for (const event of events) {
    let next: number;
    if (event.type === "tick") {
      next = setup.update === "updater" ? count + 1 : captured + 1;
    } else {
      next = count + event.add; // the click handler uses setCount(c => c + add)
    }

    if (Object.is(next, count)) continue; // same value: no re-render, effect untouched
    count = next;

    if (setup.deps === "count") {
      // count changed, so the effect cleans up and re-subscribes with the new closure
      intervalsCleared += 1;
      intervalsCreated += 1;
      captured = count;
    }
  }

  return { count, intervalsCreated, intervalsCleared };
}
