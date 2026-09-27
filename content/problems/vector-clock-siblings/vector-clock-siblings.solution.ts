export type Version = { id: string; clock: Record<string, number> };

type Order = "before" | "after" | "equal" | "concurrent";

export function resolveSiblings(versions: Version[]): { siblings: string[]; clock: Record<string, number> } {
  function compare(a: Record<string, number>, b: Record<string, number>): Order {
    let aBehind = false;
    let bBehind = false;
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      const x = a[key] ?? 0;
      const y = b[key] ?? 0;
      if (x < y) aBehind = true;
      if (y < x) bBehind = true;
    }
    if (aBehind && bBehind) return "concurrent";
    if (aBehind) return "before";
    if (bBehind) return "after";
    return "equal";
  }

  const siblings: string[] = [];
  versions.forEach((version, i) => {
    const obsolete = versions.some((other, j) => {
      const order = compare(version.clock, other.clock);
      return order === "before" || (order === "equal" && j < i);
    });
    if (!obsolete) siblings.push(version.id);
  });

  const merged: Record<string, number> = {};
  for (const { clock } of versions) {
    for (const [replica, counter] of Object.entries(clock)) {
      merged[replica] = Math.max(merged[replica] ?? 0, counter);
    }
  }

  const clock: Record<string, number> = {};
  for (const replica of Object.keys(merged).sort()) {
    if (merged[replica] > 0) clock[replica] = merged[replica];
  }

  return { siblings, clock };
}
