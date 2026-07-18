type BatchResult =
  | { status: "success"; id: string }
  | { status: "error"; id: string; message: string };

export function partitionResults(results: BatchResult[]) {
  // split results by status
}
