type Workspace = { id: string; name: string };

export function workspaceIndexById(items: Workspace[]): Record<string, Workspace> {
  const indexed: Record<string, Workspace> = {};
  for (const item of items) {
    indexed[item.id] = item;
  }
  return indexed;
}
