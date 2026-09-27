export type MatrixRow = { role: string; cells: Record<string, string> };

const ACTIONS = ["create", "read", "update", "delete"] as const;
const LETTERS = "CRUD";

export function buildMatrix(roles: string[], resources: string[], grants: string[]): MatrixRow[] {
  const granted = new Set<string>();
  for (const grant of grants) {
    const [role, resource, action] = grant.split(":");
    const targets = resource === "*" ? resources : [resource];
    const actions: readonly string[] = action === "*" ? ACTIONS : [action];
    for (const target of targets) for (const a of actions) granted.add(`${role}:${target}:${a}`);
  }
  return roles.map((role) => ({
    role,
    cells: Object.fromEntries(
      resources.map((resource) => [
        resource,
        ACTIONS.map((action, i) => (granted.has(`${role}:${resource}:${action}`) ? LETTERS[i] : "-")).join(""),
      ]),
    ),
  }));
}
