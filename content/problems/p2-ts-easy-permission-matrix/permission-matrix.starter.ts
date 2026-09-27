export type MatrixRow = { role: string; cells: Record<string, string> };

export function buildMatrix(roles: string[], resources: string[], grants: string[]) {
  // Expand "*" wildcards into concrete role:resource:action keys, then render
  // one "CRUD"-style cell per resource ("-" for a missing action).
}
