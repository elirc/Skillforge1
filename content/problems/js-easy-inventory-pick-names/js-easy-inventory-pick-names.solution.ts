type NamedRow = { name: string };

export function inventoryPickNames(rows: NamedRow[]): string[] {
  return rows.map((row) => row.name);
}
