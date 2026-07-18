type Order = { id: string; number: string; isActive: boolean };

export function orderApplyUpdate(item: Order, update: Partial<Order>): Order {
  return { ...item, ...update };
}
