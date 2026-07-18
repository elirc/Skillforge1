type BatchResult = { ok: true; id: string } | { ok: false; error: string };

export function userResultSummary(results: BatchResult[]) {
  // count successes and failures
}
