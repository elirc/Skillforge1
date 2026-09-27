export type EditorCommand =
  | { type: "insert"; text: string; t: number }
  | { type: "delete"; count: number; t: number }
  | { type: "undo" }
  | { type: "redo" };

export function replayEditor(commands: EditorCommand[]): string[] {
  let text = "";
  const undo: string[] = [];
  const redo: string[] = [];
  let lastInsertAt: number | null = null;
  const snapshots: string[] = [];

  for (const command of commands) {
    if (command.type === "insert") {
      const grouped = lastInsertAt !== null && command.t - lastInsertAt <= 1000;
      if (!grouped) undo.push(text);
      redo.length = 0;
      text += command.text;
      lastInsertAt = command.t;
    } else {
      lastInsertAt = null;
      if (command.type === "delete") {
        const n = Math.min(command.count, text.length);
        if (n > 0) {
          undo.push(text);
          redo.length = 0;
          text = text.slice(0, text.length - n);
        }
      } else if (command.type === "undo" && undo.length > 0) {
        redo.push(text);
        text = undo.pop()!;
      } else if (command.type === "redo" && redo.length > 0) {
        undo.push(text);
        text = redo.pop()!;
      }
    }
    snapshots.push(text);
  }

  return snapshots;
}
