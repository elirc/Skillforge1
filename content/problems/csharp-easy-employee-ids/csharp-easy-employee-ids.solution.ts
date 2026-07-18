type Employee = { id: string; name: string };

export function employeeIds(items: Employee[]): string[] {
  return items.map((item) => item.id);
}
