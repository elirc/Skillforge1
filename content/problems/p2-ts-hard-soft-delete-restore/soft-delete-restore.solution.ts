export type TrashRecord = { id: string; slug: string; parentId: string | null; deletedAt: number | null };
export type TrashOp =
  | { type: "delete"; id: string; at: number }
  | { type: "restore"; id: string; at: number }
  | { type: "purge"; at: number };

const RETENTION_DAYS = 30;

export function replayTrash(records: TrashRecord[], ops: TrashOp[]): { log: string[]; active: string[] } {
  let rows = records.map((record) => ({ ...record }));
  const log: string[] = [];
  const children = (id: string) => rows.filter((row) => row.parentId === id);
  const slugOwner = (row: TrashRecord) =>
    rows.find((other) => other.id !== row.id && other.deletedAt === null && other.slug === row.slug);

  for (const op of ops) {
    if (op.type === "purge") {
      const before = rows.length;
      rows = rows.filter((row) => row.deletedAt === null || op.at - row.deletedAt <= RETENTION_DAYS);
      log.push(`purge: ${before - rows.length} removed`);
      continue;
    }

    const target = rows.find((row) => row.id === op.id);
    if (!target) {
      log.push(`${op.type} ${op.id}: not found`);
      continue;
    }

    if (op.type === "delete") {
      if (target.deletedAt !== null) {
        log.push(`delete ${op.id}: already deleted`);
        continue;
      }
      target.deletedAt = op.at;
      let count = 0;
      const stack = [target.id];
      while (stack.length > 0) {
        for (const child of children(stack.pop()!)) {
          if (child.deletedAt !== null) continue;
          child.deletedAt = op.at;
          count++;
          stack.push(child.id);
        }
      }
      log.push(`delete ${op.id} (+${count} children)`);
      continue;
    }

    const stamp = target.deletedAt;
    const parent = target.parentId === null ? undefined : rows.find((row) => row.id === target.parentId);
    const owner = slugOwner(target);
    if (stamp === null) log.push(`restore ${op.id}: not deleted`);
    else if (op.at - stamp > RETENTION_DAYS) log.push(`restore ${op.id}: retention expired`);
    else if (parent && parent.deletedAt !== null) log.push(`restore ${op.id}: parent ${parent.id} is deleted`);
    else if (owner) log.push(`restore ${op.id}: slug taken by ${owner.id}`);
    else {
      target.deletedAt = null;
      let restored = 0;
      let skipped = 0;
      const queue = [target.id];
      while (queue.length > 0) {
        for (const child of children(queue.shift()!)) {
          if (child.deletedAt !== stamp) continue;
          if (slugOwner(child)) {
            skipped++;
            continue;
          }
          child.deletedAt = null;
          restored++;
          queue.push(child.id);
        }
      }
      log.push(`restore ${op.id} (+${restored} children${skipped > 0 ? `, ${skipped} skipped` : ""})`);
    }
  }

  return {
    log,
    active: rows.filter((row) => row.deletedAt === null).map((row) => row.id).sort(),
  };
}
