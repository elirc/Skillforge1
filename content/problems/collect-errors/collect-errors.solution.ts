type ImportRow = { ok: true; id: string } | { ok: false; error: string };

export function collectErrors(rows: ImportRow[]): string[] {
  const errors: string[] = [];
  for (const row of rows) {
    if (!row.ok) errors.push(row.error);
  }
  return errors;
}
