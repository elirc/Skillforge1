type ActionResult = { ok: boolean; message: string };

export function userResultMessage(result: ActionResult): string {
  return result.message;
}
