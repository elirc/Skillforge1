export type EditorCommand =
  | { type: "insert"; text: string; t: number }
  | { type: "delete"; count: number; t: number }
  | { type: "undo" }
  | { type: "redo" };

export function replayEditor(commands: EditorCommand[]) {
  // Keep undo and redo stacks of snapshots, plus the time of the last insert
  // so quick consecutive inserts share one undo step.
}
