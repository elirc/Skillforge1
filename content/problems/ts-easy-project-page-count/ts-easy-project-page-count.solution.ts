export function projectPageCount(totalItems: number, pageSize: number): number {
  return Math.ceil(totalItems / pageSize);
}
