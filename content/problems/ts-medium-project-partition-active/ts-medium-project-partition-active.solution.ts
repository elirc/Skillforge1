type Project = { id: string; active: boolean };

export function projectPartitionActive(items: Project[]): { active: Project[]; inactive: Project[] } {
  const groups: { active: Project[]; inactive: Project[] } = { active: [], inactive: [] };
  for (const item of items) {
    if (item.active) groups.active.push(item);
    else groups.inactive.push(item);
  }
  return groups;
}
