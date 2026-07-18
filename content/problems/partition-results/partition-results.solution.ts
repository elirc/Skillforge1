type BatchResult =
  | { status: "success"; id: string }
  | { status: "error"; id: string; message: string };

export function partitionResults(results: BatchResult[]): { success: BatchResult[]; error: BatchResult[] } {
  const groups: { success: BatchResult[]; error: BatchResult[] } = { success: [], error: [] };
  for (const result of results) {
    groups[result.status].push(result);
  }
  return groups;
}
