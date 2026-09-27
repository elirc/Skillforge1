type Segment = { kind: "key"; name: string } | { kind: "index"; index: number };

export function getPath(root: unknown, path: string, fallback: unknown) {
  // 1. Parse path into segments:
  //      name          -> { kind: "key", name }    (starts the path or follows a dot)
  //      [12]          -> { kind: "index", index: 12 }
  //      ["a.b"] ['x'] -> { kind: "key", name }    (backslash escapes the next char)
  //    Any malformed path -> { found: false, value: fallback, error: "Invalid path" }
  // 2. Walk root one segment at a time using own properties only.
  //    Arrays accept only index segments within bounds; objects accept keys
  //    (an index segment on an object looks up the key "12").
  //    Anything missing -> { found: false, value: fallback }
  // 3. Otherwise -> { found: true, value }  (a stored null is found)
}
