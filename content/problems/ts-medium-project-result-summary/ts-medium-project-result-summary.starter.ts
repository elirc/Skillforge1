type BatchResult = { ok: true; id: string } | { ok: false; error: string };

export function projectResultSummary(results: BatchResult[]) {
  // count successes and failures
}
