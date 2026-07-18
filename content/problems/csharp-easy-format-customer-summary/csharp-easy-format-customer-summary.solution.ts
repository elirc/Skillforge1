type Customer = { id: string; name: string };

export function formatCustomerSummary(item: Customer): string {
  return item.name + " [" + item.id + "]";
}
