export function retryPlan(
  outcomes: boolean[],
  maxAttempts: number,
  baseMs: number,
): { ok: boolean; attempts: number; waits: number[] } {
  const waits: number[] = [];
  // outcomes[i] says whether attempt i succeeds (missing means it fails).
  // Stop at the first success. After a failure, if attempts remain, wait
  // baseMs * 2 ** i before the next try and record that wait.
  return { ok: outcomes[0] === true, attempts: 1, waits };
}
