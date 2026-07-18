type Order = { id: string; isActive: boolean };

export function orderPartitionActive(items: Order[]): { active: Order[]; inactive: Order[] } {
  const groups: { active: Order[]; inactive: Order[] } = { active: [], inactive: [] };
  for (const item of items) {
    if (item.isActive) groups.active.push(item);
    else groups.inactive.push(item);
  }
  return groups;
}
