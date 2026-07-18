type BatchResult = { ok: true; id: string } | { ok: false; error: string };

export function userResultSummary(results: BatchResult[]): { success: number; failure: number } {
  return results.reduce(
    (summary, result) => {
      if (result.ok) summary.success += 1;
      else summary.failure += 1;
      return summary;
    },
    { success: 0, failure: 0 },
  );
}
