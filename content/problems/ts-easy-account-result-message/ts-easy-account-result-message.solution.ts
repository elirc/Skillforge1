type ActionResult = { ok: boolean; message: string };

export function accountResultMessage(result: ActionResult): string {
  return result.message;
}
