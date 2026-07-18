type BatchResult = { ok: true; id: string } | { ok: false; error: string };

export function teamResultSummary(results: BatchResult[]) {
  // count successes and failures
}
