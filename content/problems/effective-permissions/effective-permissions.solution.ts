type Role = { name: string; inherits: string[]; allow: string[]; deny: string[] };

export function checkPermissions(roles: Role[], userRoles: string[], checks: string[]): boolean[] {
  const byName = new Map(roles.map((role) => [role.name, role]));
  const seen = new Set<string>();
  const todo = [...userRoles];

  while (todo.length > 0) {
    const name = todo.pop()!;
    const role = byName.get(name);
    if (!role || seen.has(name)) continue;
    seen.add(name);
    todo.push(...role.inherits);
  }

  const allow: string[] = [];
  const deny: string[] = [];
  for (const name of seen) {
    allow.push(...byName.get(name)!.allow);
    deny.push(...byName.get(name)!.deny);
  }

  const matches = (pattern: string, permission: string) =>
    pattern === "*" ||
    pattern === permission ||
    (pattern.endsWith(":*") && permission.startsWith(pattern.slice(0, -1)));

  return checks.map(
    (permission) =>
      allow.some((pattern) => matches(pattern, permission)) && !deny.some((pattern) => matches(pattern, permission)),
  );
}
