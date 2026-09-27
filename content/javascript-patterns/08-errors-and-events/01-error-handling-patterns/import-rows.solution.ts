interface Row {
  id: string;
  qty: unknown;
  price: unknown;
}

type RowResult =
  | { ok: true; id: string; total: number }
  | { ok: false; id: string; field: string; message: string };

class ValidationError extends Error {
  field: string;

  constructor(message: string, field: string) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

function parseRow(row: Row): number {
  const { qty, price } = row;
  if (typeof qty !== "number" || !Number.isInteger(qty) || qty <= 0) {
    throw new ValidationError("qty must be a positive integer", "qty");
  }
  if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
    throw new ValidationError("price must be a non-negative number", "price");
  }
  return Math.round(qty * price * 100) / 100;
}

export function importRows(rows: Row[]): { imported: number; failed: number; results: RowResult[] } {
  const results = rows.map((row): RowResult => {
    try {
      return { ok: true, id: row.id, total: parseRow(row) };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { ok: false, id: row.id, field: error.field, message: error.message };
      }
      throw error;
    }
  });
  const imported = results.filter((result) => result.ok).length;
  return { imported, failed: results.length - imported, results };
}
