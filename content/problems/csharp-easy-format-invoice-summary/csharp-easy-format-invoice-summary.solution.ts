type Invoice = { id: string; number: string };

export function formatInvoiceSummary(item: Invoice): string {
  return item.number + " [" + item.id + "]";
}
