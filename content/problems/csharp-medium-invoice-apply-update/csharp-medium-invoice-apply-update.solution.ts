type Invoice = { id: string; number: string; isActive: boolean };

export function invoiceApplyUpdate(item: Invoice, update: Partial<Invoice>): Invoice {
  return { ...item, ...update };
}
