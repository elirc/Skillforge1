type Flags<T> = { [K in keyof T]: boolean };

type DirtyState<T> = { dirty: Flags<T>; patch: Partial<T> };

export function dirtyState<T extends Record<string, unknown>>(original: T, edited: T): DirtyState<T> {
  const dirty = {} as Flags<T>;
  const patch: Partial<T> = {};
  for (const key of Object.keys(original) as (keyof T)[]) {
    const changed = JSON.stringify(original[key]) !== JSON.stringify(edited[key]);
    dirty[key] = changed;
    if (changed) patch[key] = edited[key];
  }
  return { dirty, patch };
}
