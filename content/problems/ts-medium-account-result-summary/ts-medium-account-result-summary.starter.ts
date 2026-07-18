type BatchResult = { ok: true; id: string } | { ok: false; error: string };

export function accountResultSummary(results: BatchResult[]) {
  // count successes and failures
}
