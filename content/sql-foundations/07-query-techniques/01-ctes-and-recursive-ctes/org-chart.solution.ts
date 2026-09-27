interface EmployeeRow {
  id: number;
  name: string;
  managerId: number | null;
}

// WITH RECURSIVE chart AS (
//   SELECT id, name, 0 AS depth FROM employees WHERE id = @rootId        -- anchor
//   UNION ALL
//   SELECT e.id, e.name, c.depth + 1
//   FROM employees e JOIN chart c ON e.manager_id = c.id                  -- recursive step
// )
// SELECT id, name, depth FROM chart ORDER BY depth, id
export function orgChart(employees: EmployeeRow[], rootId: number) {
  const root = employees.find((e) => e.id === rootId);
  if (!root) return [];

  const result: { id: number; name: string; depth: number }[] = [];
  const seen = new Set<number>([root.id]);
  // Each pass of the loop is one iteration of the recursive member.
  let level = [root];
  let depth = 0;
  while (level.length > 0) {
    for (const e of level) result.push({ id: e.id, name: e.name, depth });
    const levelIds = new Set(level.map((e) => e.id));
    level = employees.filter((e) => e.managerId !== null && levelIds.has(e.managerId) && !seen.has(e.id));
    for (const e of level) seen.add(e.id);
    depth += 1;
  }

  return result.sort((a, b) => a.depth - b.depth || a.id - b.id);
}
