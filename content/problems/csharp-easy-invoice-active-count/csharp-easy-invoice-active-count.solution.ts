type Invoice = { id: string; isActive: boolean };

export function invoiceActiveCount(items: Invoice[]): number {
  return items.filter((item) => item.isActive).length;
}
