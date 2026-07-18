type Order = { id: string; number: string };

export function orderIds(items: Order[]): string[] {
  return items.map((item) => item.id);
}
