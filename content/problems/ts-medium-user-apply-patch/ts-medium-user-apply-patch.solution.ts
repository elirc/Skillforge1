type User = { id: string; name: string; active: boolean };

export function userApplyPatch(item: User, patch: Partial<User>): User {
  return { ...item, ...patch };
}
