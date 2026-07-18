type ImportRow = { ok: true; id: string } | { ok: false; error: string };

export function collectErrors(rows: ImportRow[]) {
  // return error messages from failed rows
}
