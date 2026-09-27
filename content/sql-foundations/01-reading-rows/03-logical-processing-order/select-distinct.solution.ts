interface CustomerRow {
  id: number;
  name: string;
  city: string | null;
}

// SELECT DISTINCT city FROM customers ORDER BY city   (SQL Server: NULL sorts first)
export function selectDistinct(rows: CustomerRow[]): (string | null)[] {
  // A Set treats null as a single value, matching how DISTINCT groups NULLs.
  const unique = [...new Set(rows.map((row) => row.city))];
  return unique.sort((a, b) => {
    if (a === b) return 0;
    if (a === null) return -1;
    if (b === null) return 1;
    return a < b ? -1 : 1;
  });
}
