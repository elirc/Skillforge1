type Product = { id: string; isActive: boolean };

export function productPartitionActive(items: Product[]): { active: Product[]; inactive: Product[] } {
  const groups: { active: Product[]; inactive: Product[] } = { active: [], inactive: [] };
  for (const item of items) {
    if (item.isActive) groups.active.push(item);
    else groups.inactive.push(item);
  }
  return groups;
}
