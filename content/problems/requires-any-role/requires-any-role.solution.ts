export function requiresAnyRole(userRoles: string[], allowedRoles: string[]): boolean {
  const allowed = new Set(allowedRoles);
  return userRoles.some((role) => allowed.has(role));
}
