type ActionResult = { ok: boolean; message: string };

export function workspaceResultMessage(result: ActionResult): string {
  return result.message;
}
