interface EmployeeRow {
  id: number;
  name: string;
  managerId: number | null;
}

// SELECT e.name AS employee, m.name AS manager
// FROM employees e
// LEFT JOIN employees m ON m.id = e.manager_id
// ORDER BY e.id
export function employeesWithManagers(employees: EmployeeRow[]) {
  // Index the "m" copy of the table by primary key (a hash join).
  const byId = new Map(employees.map((m) => [m.id, m]));
  return [...employees]
    .sort((a, b) => a.id - b.id)
    .map((e) => {
      const m = e.managerId === null ? undefined : byId.get(e.managerId);
      return { employee: e.name, manager: m ? m.name : null };
    });
}
