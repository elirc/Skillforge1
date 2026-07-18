type Team = { id: string; label: string; active: boolean };

export function teamApplyPatch(item: Team, patch: Partial<Team>) {
  // apply the patch immutably
}
