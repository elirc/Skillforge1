type Order = { id: string; isActive: boolean };

export function orderActiveCount(items: Order[]): number {
  return items.filter((item) => item.isActive).length;
}
