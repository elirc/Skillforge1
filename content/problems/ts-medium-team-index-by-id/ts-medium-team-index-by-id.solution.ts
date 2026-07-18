type Team = { id: string; label: string };

export function teamIndexById(items: Team[]): Record<string, Team> {
  const indexed: Record<string, Team> = {};
  for (const item of items) {
    indexed[item.id] = item;
  }
  return indexed;
}
