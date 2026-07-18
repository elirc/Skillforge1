type Project = { id: string; title: string; active: boolean };

export function projectApplyPatch(item: Project, patch: Partial<Project>): Project {
  return { ...item, ...patch };
}
