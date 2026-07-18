type Workspace = { id: string; name: string; active: boolean };

export function workspaceApplyPatch(item: Workspace, patch: Partial<Workspace>) {
  // apply the patch immutably
}
