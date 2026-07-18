type Workspace = { id: string; active: boolean };

export function activeWorkspaceCount(items: Workspace[]): number {
  return items.filter((item) => item.active).length;
}
