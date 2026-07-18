type Customer = { id: string; isActive: boolean };

export function customerPartitionActive(items: Customer[]): { active: Customer[]; inactive: Customer[] } {
  const groups: { active: Customer[]; inactive: Customer[] } = { active: [], inactive: [] };
  for (const item of items) {
    if (item.isActive) groups.active.push(item);
    else groups.inactive.push(item);
  }
  return groups;
}
