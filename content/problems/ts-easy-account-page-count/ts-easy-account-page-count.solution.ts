export function accountPageCount(totalItems: number, pageSize: number): number {
  return Math.ceil(totalItems / pageSize);
}
