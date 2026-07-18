type Project = { id: string; active: boolean };

export function activeProjectCount(items: Project[]): number {
  return items.filter((item) => item.active).length;
}
