type Workspace = { id: string; name: string };

export function formatWorkspaceLabel(item: Workspace): string {
  return item.name + " (" + item.id + ")";
}
