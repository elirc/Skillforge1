type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
type Change =
  | { path: string; kind: "added"; after: Json }
  | { path: string; kind: "removed"; before: Json }
  | { path: string; kind: "changed"; before: Json; after: Json };

function isObject(value: Json): value is { [key: string]: Json } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function has(object: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function keyPath(prefix: string, key: string): string {
  return prefix === "" ? key : `${prefix}.${key}`;
}

function walk(before: Json, after: Json, path: string, changes: Change[]): void {
  if (Array.isArray(before) && Array.isArray(after)) {
    const length = Math.max(before.length, after.length);
    for (let index = 0; index < length; index++) {
      const itemPath = `${path}[${index}]`;
      if (index >= after.length) changes.push({ path: itemPath, kind: "removed", before: before[index] });
      else if (index >= before.length) changes.push({ path: itemPath, kind: "added", after: after[index] });
      else walk(before[index], after[index], itemPath, changes);
    }
    return;
  }
  if (isObject(before) && isObject(after)) {
    for (const key of Object.keys(before)) {
      if (!has(after, key)) changes.push({ path: keyPath(path, key), kind: "removed", before: before[key] });
      else walk(before[key], after[key], keyPath(path, key), changes);
    }
    for (const key of Object.keys(after)) {
      if (!has(before, key)) changes.push({ path: keyPath(path, key), kind: "added", after: after[key] });
    }
    return;
  }
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    changes.push({ path, kind: "changed", before, after });
  }
}

export function diff(before: Json, after: Json): Change[] {
  const changes: Change[] = [];
  walk(before, after, "", changes);
  return changes;
}
