type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

// Two type parameters: T for success values, E for errors. The return type
// uses them again, so collectResults over Result<number, string>[] gives
// { ok: true; value: number[] } | { ok: false; errors: string[] }.
type Collected<T, E> = { ok: true; value: T[] } | { ok: false; errors: E[] };

export function collectResults<T, E>(results: Result<T, E>[]) {
  // If every result is ok, return { ok: true, value: [...all values in order] }.
  // Otherwise return { ok: false, errors: [...every error in order] } so a form
  // can show all problems at once instead of only the first.
  // An empty list is ok with an empty value array.
}
