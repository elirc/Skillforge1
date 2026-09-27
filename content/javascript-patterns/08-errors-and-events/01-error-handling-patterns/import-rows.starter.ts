interface Row {
  id: string;
  qty: unknown;
  price: unknown;
}

type RowResult =
  | { ok: true; id: string; total: number }
  | { ok: false; id: string; field: string; message: string };

// TODO: give ValidationError a name of "ValidationError" and a field property.
class ValidationError extends Error {}

function parseRow(row: Row): number {
  // TODO: throw ValidationError("qty must be a positive integer", "qty") and
  // ValidationError("price must be a non-negative number", "price") instead.
  const qty = row.qty as number;
  const price = row.price as number;
  return Math.round(qty * price * 100) / 100;
}

export function importRows(rows: Row[]): { imported: number; failed: number; results: RowResult[] } {
  // TODO: one bad row should become { ok: false, ... } instead of aborting the batch.
  const results: RowResult[] = rows.map((row) => ({ ok: true, id: row.id, total: parseRow(row) }));
  return { imported: results.length, failed: 0, results };
}
