type Employee = { salary: number };

export function employeeTotalSalary(items: Employee[]): number {
  return items.reduce((total, item) => total + item.salary, 0);
}
