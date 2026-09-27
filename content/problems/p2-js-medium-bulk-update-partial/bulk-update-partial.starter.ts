export type Task = { id: string; version: number; status: string; assignee: string | null };
export type TaskUpdate = { id: string; expectedVersion: number; changes: Record<string, unknown> };

export function applyBulkUpdate(records: Task[], updates: TaskUpdate[]) {
  // Copy the records, then apply each update in order.
  // Checks: not found, version conflict, no changes, field not editable, invalid status.
  // No-op updates go to `unchanged` without a version bump.
}
