type Account = { id: string; displayName: string; active: boolean };

export function accountApplyPatch(item: Account, patch: Partial<Account>): Account {
  return { ...item, ...patch };
}
