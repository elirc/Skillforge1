type BatchResult = { ok: true; id: string } | { ok: false; error: string };

export function workspaceResultSummary(results: BatchResult[]) {
  // count successes and failures
}
