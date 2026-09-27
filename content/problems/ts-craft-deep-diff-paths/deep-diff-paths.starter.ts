type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
type Change =
  | { path: string; kind: "added"; after: Json }
  | { path: string; kind: "removed"; before: Json }
  | { path: string; kind: "changed"; before: Json; after: Json };

export function diff(before: Json, after: Json) {
  // Walk both values together, starting at path "".
  //   objects: keys of before in order (removed or recurse), then keys only in after (added)
  //   arrays: index by index; extra items at the end are removed or added
  //   anything else: if different, one "changed" entry at this path
  // Paths: "user.name", "tags[2]", "items[0].qty"; the root itself is "".
}
