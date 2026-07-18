type Workspace = { id: string; active: boolean };

export function workspacePartitionActive(items: Workspace[]): { active: Workspace[]; inactive: Workspace[] } {
  const groups: { active: Workspace[]; inactive: Workspace[] } = { active: [], inactive: [] };
  for (const item of items) {
    if (item.active) groups.active.push(item);
    else groups.inactive.push(item);
  }
  return groups;
}
