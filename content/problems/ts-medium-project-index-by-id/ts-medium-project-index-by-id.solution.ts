type Project = { id: string; title: string };

export function projectIndexById(items: Project[]): Record<string, Project> {
  const indexed: Record<string, Project> = {};
  for (const item of items) {
    indexed[item.id] = item;
  }
  return indexed;
}
