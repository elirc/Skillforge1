export function customerPageCount(totalItems: number, pageSize: number): number {
  return Math.ceil(totalItems / pageSize);
}
