type NamedRow = { name: string };

export function workoutPickNames(rows: NamedRow[]): string[] {
  return rows.map((row) => row.name);
}
