type Workspace = { id: string; name: string };

export function workspaceIds(items: Workspace[]): string[] {
  return items.map((item) => item.id);
}
