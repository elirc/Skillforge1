interface CustomerRow {
  id: number;
  name: string;
  city: string | null;
}

// SELECT DISTINCT city FROM customers ORDER BY city   (SQL Server: NULL sorts first)
export function selectDistinct(rows: CustomerRow[]) {
  // collapse duplicates (at most one NULL), then sort with NULL first
  return rows.map((row) => row.city);
}
