export function productPageCount(totalItems: number, pageSize: number): number {
  return Math.ceil(totalItems / pageSize);
}
