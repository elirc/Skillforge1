type ApiResult =
  | { status: "success"; message: string }
  | { status: "error"; error: string };

export function parseStatusMessage(result: ApiResult): string {
  return result.status === "success" ? result.message : result.error;
}
