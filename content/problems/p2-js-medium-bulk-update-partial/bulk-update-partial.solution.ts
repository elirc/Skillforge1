export type Task = { id: string; version: number; status: string; assignee: string | null };
export type TaskUpdate = { id: string; expectedVersion: number; changes: Record<string, unknown> };

const EDITABLE = ["status", "assignee"];
const STATUSES = ["open", "in_progress", "done"];

export function applyBulkUpdate(records: Task[], updates: TaskUpdate[]) {
  const next = records.map((record) => ({ ...record }));
  const byId = new Map(next.map((record) => [record.id, record]));
  const updated: string[] = [];
  const unchanged: string[] = [];
  const failed: { id: string; reason: string }[] = [];

  for (const { id, expectedVersion, changes } of updates) {
    const record = byId.get(id);
    const keys = Object.keys(changes);
    const badKey = keys.find((key) => !EDITABLE.includes(key));
    let reason: string | null = null;
    if (!record) reason = "not found";
    else if (record.version !== expectedVersion) reason = `version conflict (expected ${expectedVersion}, found ${record.version})`;
    else if (keys.length === 0) reason = "no changes";
    else if (badKey !== undefined) reason = `field not editable: ${badKey}`;
    else if ("status" in changes && !STATUSES.includes(changes.status as string)) reason = `invalid status: ${String(changes.status)}`;

    if (reason !== null || !record) {
      failed.push({ id, reason: reason ?? "not found" });
      continue;
    }
    const current = record as Record<string, unknown>;
    if (keys.every((key) => current[key] === changes[key])) {
      unchanged.push(id);
      continue;
    }
    Object.assign(record, changes);
    record.version += 1;
    updated.push(id);
  }
  return { records: next, updated, unchanged, failed };
}
