type Result =
  | { ok: true; value: string }
  | { ok: false; error: string };

export function resultMessage(result: Result): string {
  return result.ok ? result.value : `Error: ${result.error}`;
}
