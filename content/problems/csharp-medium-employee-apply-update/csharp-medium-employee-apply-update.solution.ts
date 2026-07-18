type Employee = { id: string; name: string; isActive: boolean };

export function employeeApplyUpdate(item: Employee, update: Partial<Employee>): Employee {
  return { ...item, ...update };
}
