export function billingPaginationLabel(page: number, pageSize: number, total: number): string {
  if (total === 0) return "0-0 of 0";
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return String(start) + "-" + String(end) + " of " + String(total);
}
