export function teamPageCount(totalItems: number, pageSize: number): number {
  return Math.ceil(totalItems / pageSize);
}
