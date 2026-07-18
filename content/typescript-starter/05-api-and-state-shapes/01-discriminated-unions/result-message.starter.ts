type Result =
  | { ok: true; value: string }
  | { ok: false; error: string };

export function resultMessage(result: Result) {
  // use result.ok to choose the right branch
}
