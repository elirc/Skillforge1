type Account = { id: string; active: boolean };

export function accountPartitionActive(items: Account[]): { active: Account[]; inactive: Account[] } {
  const groups: { active: Account[]; inactive: Account[] } = { active: [], inactive: [] };
  for (const item of items) {
    if (item.active) groups.active.push(item);
    else groups.inactive.push(item);
  }
  return groups;
}
