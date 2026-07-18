type Employee = { id: string; isActive: boolean };

export function employeeActiveCount(items: Employee[]): number {
  return items.filter((item) => item.isActive).length;
}
