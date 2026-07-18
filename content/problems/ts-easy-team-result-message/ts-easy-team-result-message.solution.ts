type ActionResult = { ok: boolean; message: string };

export function teamResultMessage(result: ActionResult): string {
  return result.message;
}
