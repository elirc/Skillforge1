type NamedRow = { name: string };

export function temperaturePickNames(rows: NamedRow[]): string[] {
  return rows.map((row) => row.name);
}
