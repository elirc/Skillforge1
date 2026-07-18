type Invoice = { id: string; isActive: boolean };

export function invoicePartitionActive(items: Invoice[]): { active: Invoice[]; inactive: Invoice[] } {
  const groups: { active: Invoice[]; inactive: Invoice[] } = { active: [], inactive: [] };
  for (const item of items) {
    if (item.isActive) groups.active.push(item);
    else groups.inactive.push(item);
  }
  return groups;
}
