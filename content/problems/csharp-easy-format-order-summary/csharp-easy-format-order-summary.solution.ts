type Order = { id: string; number: string };

export function formatOrderSummary(item: Order): string {
  return item.number + " [" + item.id + "]";
}
