type Role = { name: string; inherits: string[]; allow: string[]; deny: string[] };

export function checkPermissions(roles: Role[], userRoles: string[], checks: string[]) {
  // Expand roles through inheritance (guard against cycles), collect allow and
  // deny patterns, then answer each check with deny-overrides.
}
