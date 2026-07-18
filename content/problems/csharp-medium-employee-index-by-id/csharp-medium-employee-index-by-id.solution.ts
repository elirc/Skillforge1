type Employee = { id: string; name: string };

export function employeeIndexById(items: Employee[]): Record<string, Employee> {
  const indexed: Record<string, Employee> = {};
  for (const item of items) {
    indexed[item.id] = item;
  }
  return indexed;
}
