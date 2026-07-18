type User = { id: string; active: boolean };

export function userPartitionActive(items: User[]): { active: User[]; inactive: User[] } {
  const groups: { active: User[]; inactive: User[] } = { active: [], inactive: [] };
  for (const item of items) {
    if (item.active) groups.active.push(item);
    else groups.inactive.push(item);
  }
  return groups;
}
