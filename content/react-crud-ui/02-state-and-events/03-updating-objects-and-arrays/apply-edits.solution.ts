type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

type Edit =
  | { op: "set"; path: string[]; value: Json }
  | { op: "push"; path: string[]; value: Json }
  | { op: "remove"; path: string[]; index: number };

// Copy only the objects and arrays along `path`; everything else is shared.
function updateIn(value: Json, path: string[], update: (current: Json) => Json): Json {
  if (path.length === 0) return update(value);
  const [head, ...rest] = path;
  if (Array.isArray(value)) {
    const index = Number(head);
    const copy = [...value];
    copy[index] = updateIn(value[index], rest, update);
    return copy;
  }
  const record = (value ?? {}) as { [key: string]: Json };
  return { ...record, [head]: updateIn(record[head] ?? null, rest, update) };
}

export function applyEdits(state: Json, edits: Edit[]): { original: Json; next: Json } {
  let next = state;
  for (const edit of edits) {
    if (edit.op === "set") {
      next = updateIn(next, edit.path, () => edit.value);
    } else if (edit.op === "push") {
      next = updateIn(next, edit.path, (current) => [...(current as Json[]), edit.value]);
    } else {
      next = updateIn(next, edit.path, (current) => (current as Json[]).filter((_, i) => i !== edit.index));
    }
  }
  return { original: state, next };
}
