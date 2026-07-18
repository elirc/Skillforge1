type NamedRow = { name: string };

export function latencyPickNames(rows: NamedRow[]): string[] {
  return rows.map((row) => row.name);
}
