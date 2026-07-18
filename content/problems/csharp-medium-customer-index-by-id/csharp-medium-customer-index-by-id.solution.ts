type Customer = { id: string; name: string };

export function customerIndexById(items: Customer[]): Record<string, Customer> {
  const indexed: Record<string, Customer> = {};
  for (const item of items) {
    indexed[item.id] = item;
  }
  return indexed;
}
