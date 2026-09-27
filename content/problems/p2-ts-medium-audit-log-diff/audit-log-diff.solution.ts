const fmt = (value: unknown) => JSON.stringify(value);

function present(record: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key) && record[key] !== undefined;
}

function missingFrom(source: unknown[], other: unknown[]): string[] {
  const otherKeys = new Set(other.map(fmt));
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of source) {
    const key = fmt(item);
    if (otherKeys.has(key) || seen.has(key)) continue;
    seen.add(key);
    result.push(key);
  }
  return result;
}

export function auditLines(before: Record<string, unknown>, after: Record<string, unknown>, ignore: string[]): string[] {
  const skip = new Set(ignore);
  const keys = [...Object.keys(before), ...Object.keys(after).filter((key) => !Object.prototype.hasOwnProperty.call(before, key))];
  const lines: string[] = [];

  for (const key of keys) {
    if (skip.has(key)) continue;
    const inBefore = present(before, key);
    const inAfter = present(after, key);
    const oldValue = before[key];
    const newValue = after[key];
    if (!inBefore && !inAfter) continue;
    if (!inBefore) {
      lines.push(`${key}: set to ${fmt(newValue)}`);
    } else if (!inAfter) {
      lines.push(`${key}: cleared (was ${fmt(oldValue)})`);
    } else if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      const added = missingFrom(newValue, oldValue);
      const removed = missingFrom(oldValue, newValue);
      if (added.length > 0) lines.push(`${key}: added ${added.join(", ")}`);
      if (removed.length > 0) lines.push(`${key}: removed ${removed.join(", ")}`);
    } else if (fmt(oldValue) !== fmt(newValue)) {
      lines.push(`${key}: ${fmt(oldValue)} -> ${fmt(newValue)}`);
    }
  }
  return lines;
}
