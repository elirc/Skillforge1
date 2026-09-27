// A mapped type builds a new object type by looping over the keys of T.
// Flags<{ name: string; age: number }> is { name: boolean; age: boolean }.
type Flags<T> = { [K in keyof T]: boolean };

type DirtyState<T> = { dirty: Flags<T>; patch: Partial<T> };

// Compare a form's original values with its edited values.
export function dirtyState<T extends Record<string, unknown>>(original: T, edited: T) {
  // Return { dirty, patch }:
  //   dirty: one boolean per key of original (same key order) - true when changed
  //   patch: only the changed keys, with their edited values (same key order)
  // Two values are equal when JSON.stringify gives the same text, so arrays
  // and nested objects compare by content, not by reference.
}
