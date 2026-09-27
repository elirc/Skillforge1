type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
type ArrayPolicy = "replace" | "concat" | "union";

export function deepMerge(base: Json, override: Json, arrays: ArrayPolicy) {
  // Two plain objects: merge key by key (base keys first, then new override keys).
  //   An override value of null deletes the key.
  // Two arrays: apply the policy ("replace" | "concat" | "union").
  // Anything else: the override wins.
  // Never mutate base or override.
}
