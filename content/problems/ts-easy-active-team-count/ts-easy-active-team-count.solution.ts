type Team = { id: string; active: boolean };

export function activeTeamCount(items: Team[]): number {
  return items.filter((item) => item.active).length;
}
