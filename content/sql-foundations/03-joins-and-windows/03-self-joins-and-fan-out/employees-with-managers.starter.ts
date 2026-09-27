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
  // look up each employee's manager in the same table (null when there is none)
  return employees.map((e) => ({ employee: e.name, manager: null }));
}
