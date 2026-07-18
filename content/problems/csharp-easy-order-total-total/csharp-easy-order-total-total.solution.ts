type Order = { total: number };

export function orderTotalTotal(items: Order[]): number {
  return items.reduce((total, item) => total + item.total, 0);
}
