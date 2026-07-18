type CounterAction = { type: "increment" } | { type: "decrement" } | { type: "reset" };

export function counterReducer(count: number, action: CounterAction) {
  // return the next counter state
}
