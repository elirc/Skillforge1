type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

type Edit =
  | { op: "set"; path: string[]; value: Json } // set the value at path
  | { op: "push"; path: string[]; value: Json } // append to the array at path
  | { op: "remove"; path: string[]; index: number }; // remove array[index] at path

// Paths are keys (or array indexes as strings): ["address", "city"], ["tags"], ["lines", "0", "qty"].
//
// This version MUTATES `state`. In React, setState(sameObjectMutated) is
// Object.is-equal to the old state, so the screen would not update, and the
// "original" we return below ends up changed too.
// Rewrite it to return a NEW state for every edit, copying only the objects and
// arrays along the path (spread / map / filter), and leave `state` untouched.
// Keep existing keys in their original order.
export function applyEdits(state: Json, edits: Edit[]) {
  for (const edit of edits) {
    let target = state as { [key: string]: Json };
    const parents = edit.path.slice(0, -1);
    const last = edit.path[edit.path.length - 1];
    for (const key of parents) target = target[key] as { [key: string]: Json };
    if (edit.op === "set") target[last] = edit.value;
    else if (edit.op === "push") (target[last] as Json[]).push(edit.value);
    else (target[last] as Json[]).splice(edit.index, 1);
  }
  return { original: state, next: state };
}
