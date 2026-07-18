type Invoice = { amount: number };

export function invoiceTotalAmount(items: Invoice[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}
