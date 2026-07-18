type Project = { id: string; title: string };

export function formatProjectLabel(item: Project): string {
  return item.title + " (" + item.id + ")";
}
