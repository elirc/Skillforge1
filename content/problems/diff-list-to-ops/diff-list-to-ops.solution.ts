export type Row = { id: string; [field: string]: string | number | boolean | null };

type Op =
  | { op: "delete"; id: string }
  | { op: "update"; id: string; changes: Record<string, string | number | boolean | null> }
  | { op: "insert"; item: Row };

export function diffRows(before: Row[], after: Row[]): Op[] {
  const beforeById = new Map(before.map((row) => [row.id, row]));
  const afterIds = new Set(after.map((row) => row.id));

  const deletes: Op[] = before.filter((row) => !afterIds.has(row.id)).map((row) => ({ op: "delete", id: row.id }));
  const updates: Op[] = [];
  const inserts: Op[] = [];

  for (const row of after) {
    const previous = beforeById.get(row.id);
    if (!previous) {
      inserts.push({ op: "insert", item: row });
      continue;
    }
    const changes: Record<string, string | number | boolean | null> = {};
    for (const key of Object.keys(row)) {
      if (row[key] !== previous[key]) changes[key] = row[key];
    }
    if (Object.keys(changes).length > 0) updates.push({ op: "update", id: row.id, changes });
  }

  return [...deletes, ...updates, ...inserts];
}
