type Invoice = { dueDate: string; paid: boolean };

export function invoiceStatus(invoice: Invoice, today: string): string {
  if (invoice.paid) return "paid";
  if (invoice.dueDate < today) return "overdue";
  return "open";
}
