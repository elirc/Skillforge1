type NamedRow = { name: string };

export function quizPickNames(rows: NamedRow[]): string[] {
  return rows.map((row) => row.name);
}
