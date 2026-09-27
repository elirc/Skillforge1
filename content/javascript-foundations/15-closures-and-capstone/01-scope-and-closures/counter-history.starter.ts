// makeCounter should return three functions that all share one private `count`.
function makeCounter(start: number) {
  return {
    // Bug: each function makes its OWN fresh variable, so nothing is remembered.
    // Move `let count = start;` up so all three functions close over the same variable.
    increment: () => {
      let count = start;
      count += 1;
      return count;
    },
    decrement: () => {
      let count = start;
      count -= 1;
      return count;
    },
    reset: () => start,
  };
}

// Run each action ("inc", "dec", "reset") on ONE counter and record the value after it.
// Unknown actions leave the count alone but still record it.
export function counterHistory(start: number, actions: string[]): number[] {
  const counter = makeCounter(start);
  let current = start;
  const history: number[] = [];
  for (const action of actions) {
    if (action === "inc") current = counter.increment();
    else if (action === "dec") current = counter.decrement();
    else if (action === "reset") current = counter.reset();
    history.push(current);
  }
  return history;
}
