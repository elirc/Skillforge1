type Team = { id: string; label: string };

export function teamIds(items: Team[]): string[] {
  return items.map((item) => item.id);
}
