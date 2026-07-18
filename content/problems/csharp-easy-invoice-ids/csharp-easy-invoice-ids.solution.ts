type Invoice = { id: string; number: string };

export function invoiceIds(items: Invoice[]): string[] {
  return items.map((item) => item.id);
}
