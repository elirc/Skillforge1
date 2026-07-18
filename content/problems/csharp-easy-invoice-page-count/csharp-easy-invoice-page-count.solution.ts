export function invoicePageCount(totalItems: number, pageSize: number): number {
  return Math.ceil(totalItems / pageSize);
}
