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
  // Start from the anchor row, then repeatedly add everyone whose manager is in the previous level.
  // Keep a Set of visited ids so a cycle in bad data cannot loop forever.
  const result: { id: number; name: string; depth: number }[] = [];
  return result;
}
