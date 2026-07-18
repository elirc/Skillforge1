type Team = { id: string; label: string };

export function formatTeamLabel(item: Team): string {
  return item.label + " (" + item.id + ")";
}
