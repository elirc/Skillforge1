export function retryPlan(
  outcomes: boolean[],
  maxAttempts: number,
  baseMs: number,
): { ok: boolean; attempts: number; waits: number[] } {
  const waits: number[] = [];
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (outcomes[attempt] === true) return { ok: true, attempts: attempt + 1, waits };
    if (attempt < maxAttempts - 1) waits.push(baseMs * 2 ** attempt);
  }
  return { ok: false, attempts: maxAttempts, waits };
}
