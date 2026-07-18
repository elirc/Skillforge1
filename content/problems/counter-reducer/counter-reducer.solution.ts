type CounterAction = { type: "increment" } | { type: "decrement" } | { type: "reset" };

export function counterReducer(count: number, action: CounterAction): number {
  if (action.type === "increment") return count + 1;
  if (action.type === "decrement") return count - 1;
  return 0;
}
