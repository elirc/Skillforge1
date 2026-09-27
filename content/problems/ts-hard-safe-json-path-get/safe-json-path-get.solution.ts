type Segment = { kind: "key"; name: string } | { kind: "index"; index: number };
type Lookup = { found: true; value: unknown } | { found: false; value: unknown; error?: string };

class PathSyntaxError extends Error {}

function isNameChar(char: string): boolean {
  return char !== "." && char !== "[" && char !== "]" && char !== '"' && char !== "'";
}

function parsePath(path: string): Segment[] {
  const segments: Segment[] = [];
  let i = 0;
  // A dot is required between segments, except before a bracket.
  let expectName = true;

  while (i < path.length) {
    const char = path[i];
    if (char === "[") {
      i++;
      const quote = path[i];
      if (quote === '"' || quote === "'") {
        i++;
        let name = "";
        while (i < path.length && path[i] !== quote) {
          if (path[i] === "\\") {
            i++;
            if (i >= path.length) throw new PathSyntaxError("Invalid path");
          }
          name += path[i];
          i++;
        }
        if (path[i] !== quote || path[i + 1] !== "]") throw new PathSyntaxError("Invalid path");
        i += 2;
        segments.push({ kind: "key", name });
      } else {
        let digits = "";
        while (i < path.length && /[0-9]/.test(path[i])) digits += path[i++];
        if (digits === "" || path[i] !== "]") throw new PathSyntaxError("Invalid path");
        i++;
        segments.push({ kind: "index", index: Number(digits) });
      }
      expectName = false;
    } else if (char === ".") {
      if (expectName) throw new PathSyntaxError("Invalid path"); // leading or double dot
      i++;
      expectName = true;
      if (i >= path.length) throw new PathSyntaxError("Invalid path"); // trailing dot
    } else {
      // A bare name must start the path or follow a dot.
      if (!expectName) throw new PathSyntaxError("Invalid path");
      let name = "";
      while (i < path.length && isNameChar(path[i])) name += path[i++];
      if (name === "") throw new PathSyntaxError("Invalid path");
      segments.push({ kind: "key", name });
      expectName = false;
    }
  }
  return segments;
}

export function getPath(root: unknown, path: string, fallback: unknown): Lookup {
  let segments: Segment[];
  try {
    segments = parsePath(path);
  } catch (error) {
    if (error instanceof PathSyntaxError) return { found: false, value: fallback, error: error.message };
    throw error;
  }

  let current: unknown = root;
  for (const segment of segments) {
    if (typeof current !== "object" || current === null) return { found: false, value: fallback };
    if (Array.isArray(current)) {
      if (segment.kind !== "index" || segment.index >= current.length) return { found: false, value: fallback };
      current = current[segment.index];
      continue;
    }
    const key = segment.kind === "index" ? String(segment.index) : segment.name;
    if (!Object.prototype.hasOwnProperty.call(current, key)) return { found: false, value: fallback };
    current = (current as Record<string, unknown>)[key];
  }
  return { found: true, value: current };
}
