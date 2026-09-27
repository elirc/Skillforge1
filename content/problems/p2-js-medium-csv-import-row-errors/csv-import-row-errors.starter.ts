export type ImportedUser = { name: string; email: string; role: string };
export type RowError = { line: number; errors: string[] };

export function importUsers(csv: string) {
  // 1. Map header names -> column index; report the first missing column.
  // 2. For each non-blank line, collect errors in the documented order.
  // 3. Import clean rows; remember email -> line for duplicate detection.
}
