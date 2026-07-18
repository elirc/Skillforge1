type ApiUser = { id: string; display_name: string; is_active: boolean };
type AppUser = { id: string; displayName: string; isActive: boolean };

export function normalizeApiUsers(users: ApiUser[]): AppUser[] {
  return users.map((user) => ({ id: user.id, displayName: user.display_name, isActive: user.is_active }));
}
