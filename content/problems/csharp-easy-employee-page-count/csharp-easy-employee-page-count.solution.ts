export function employeePageCount(totalItems: number, pageSize: number): number {
  return Math.ceil(totalItems / pageSize);
}
