export function orderPageCount(totalItems: number, pageSize: number): number {
  return Math.ceil(totalItems / pageSize);
}
