type Workspace = { id: string; name: string; active: boolean };

export function workspaceApplyPatch(item: Workspace, patch: Partial<Workspace>): Workspace {
  return { ...item, ...patch };
}
