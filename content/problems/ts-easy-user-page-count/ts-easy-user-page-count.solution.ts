export function userPageCount(totalItems: number, pageSize: number): number {
  return Math.ceil(totalItems / pageSize);
}
