type Invoice = { id: string; number: string };

export function invoiceIndexById(items: Invoice[]): Record<string, Invoice> {
  const indexed: Record<string, Invoice> = {};
  for (const item of items) {
    indexed[item.id] = item;
  }
  return indexed;
}
