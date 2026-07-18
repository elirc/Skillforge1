type Project = { id: string; title: string; active: boolean };

export function projectApplyPatch(item: Project, patch: Partial<Project>) {
  // apply the patch immutably
}
