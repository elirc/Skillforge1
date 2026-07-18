type Customer = { id: string; name: string };

export function customerIds(items: Customer[]): string[] {
  return items.map((item) => item.id);
}
