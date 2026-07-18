type ActionResult = { ok: boolean; message: string };

export function projectResultMessage(result: ActionResult): string {
  return result.message;
}
