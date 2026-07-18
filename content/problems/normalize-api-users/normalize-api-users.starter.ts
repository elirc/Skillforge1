type ApiUser = { id: string; display_name: string; is_active: boolean };

export function normalizeApiUsers(users: ApiUser[]) {
  // convert snake_case fields to camelCase fields
}
