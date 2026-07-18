type Team = { id: string; active: boolean };

export function teamPartitionActive(items: Team[]): { active: Team[]; inactive: Team[] } {
  const groups: { active: Team[]; inactive: Team[] } = { active: [], inactive: [] };
  for (const item of items) {
    if (item.active) groups.active.push(item);
    else groups.inactive.push(item);
  }
  return groups;
}
