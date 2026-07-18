type Team = { id: string; label: string; active: boolean };

export function teamApplyPatch(item: Team, patch: Partial<Team>): Team {
  return { ...item, ...patch };
}
