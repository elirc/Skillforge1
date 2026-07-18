type Employee = { id: string; isActive: boolean };

export function employeePartitionActive(items: Employee[]): { active: Employee[]; inactive: Employee[] } {
  const groups: { active: Employee[]; inactive: Employee[] } = { active: [], inactive: [] };
  for (const item of items) {
    if (item.isActive) groups.active.push(item);
    else groups.inactive.push(item);
  }
  return groups;
}
