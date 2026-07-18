type User = { id: string; name: string; active: boolean };

export function userApplyPatch(item: User, patch: Partial<User>) {
  // apply the patch immutably
}
