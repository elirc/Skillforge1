type ApiResult =
  | { status: "success"; message: string }
  | { status: "error"; error: string };

export function parseStatusMessage(result: ApiResult) {
  // return the right message for each result shape
}
