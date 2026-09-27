type Direction = "asc" | "desc";

function compareValues(a: unknown, b: unknown): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

export function sortBy<T, K extends keyof T>(items: T[], key: K, direction: Direction): T[] {
  const sign = direction === "asc" ? 1 : -1;
  return [...items].sort((left, right) => {
    const a: T[K] = left[key];
    const b: T[K] = right[key];
    const aMissing = a === null || a === undefined;
    const bMissing = b === null || b === undefined;
    if (aMissing || bMissing) return Number(aMissing) - Number(bMissing);
    return sign * compareValues(a, b);
  });
}
