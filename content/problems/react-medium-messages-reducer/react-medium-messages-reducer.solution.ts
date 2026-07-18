type Action = { type: "increment" } | { type: "decrement" } | { type: "reset" };

export function messagesReducer(value: number, action: Action): number {
  if (action.type === "increment") return value + 1;
  if (action.type === "decrement") return value - 1;
  return 0;
}
