type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

type Collected<T, E> = { ok: true; value: T[] } | { ok: false; errors: E[] };

export function collectResults<T, E>(results: Result<T, E>[]): Collected<T, E> {
  const values: T[] = [];
  const errors: E[] = [];
  for (const result of results) {
    if (result.ok) values.push(result.value);
    else errors.push(result.error);
  }
  return errors.length === 0 ? { ok: true, value: values } : { ok: false, errors };
}
