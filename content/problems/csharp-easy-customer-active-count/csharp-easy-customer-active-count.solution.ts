type Customer = { id: string; isActive: boolean };

export function customerActiveCount(items: Customer[]): number {
  return items.filter((item) => item.isActive).length;
}
