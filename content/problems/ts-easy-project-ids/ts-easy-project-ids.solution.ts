type Project = { id: string; title: string };

export function projectIds(items: Project[]): string[] {
  return items.map((item) => item.id);
}
