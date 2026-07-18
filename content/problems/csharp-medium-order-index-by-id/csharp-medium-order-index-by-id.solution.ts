type Order = { id: string; number: string };

export function orderIndexById(items: Order[]): Record<string, Order> {
  const indexed: Record<string, Order> = {};
  for (const item of items) {
    indexed[item.id] = item;
  }
  return indexed;
}
