type Employee = { id: string; name: string };

export function formatEmployeeSummary(item: Employee): string {
  return item.name + " [" + item.id + "]";
}
