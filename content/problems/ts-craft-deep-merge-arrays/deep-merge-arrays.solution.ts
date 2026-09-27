type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
type ArrayPolicy = "replace" | "concat" | "union";

function isObject(value: Json): value is { [key: string]: Json } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function has(object: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function clone(value: Json): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

function mergeArrays(base: Json[], override: Json[], policy: ArrayPolicy): Json[] {
  if (policy === "replace") return override.map(clone);
  if (policy === "concat") return [...base, ...override].map(clone);
  const seen = new Set<string>();
  const result: Json[] = [];
  for (const item of [...base, ...override]) {
    const key = JSON.stringify(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(clone(item));
  }
  return result;
}

export function deepMerge(base: Json, override: Json, arrays: ArrayPolicy): Json {
  if (Array.isArray(base) && Array.isArray(override)) return mergeArrays(base, override, arrays);
  if (!isObject(base) || !isObject(override)) return clone(override);

  const result: { [key: string]: Json } = {};
  for (const [key, value] of Object.entries(base)) {
    if (!has(override, key)) {
      result[key] = clone(value);
    } else if (override[key] !== null) {
      result[key] = deepMerge(value, override[key], arrays);
    }
    // override[key] === null: the key is deleted (JSON Merge Patch style).
  }
  for (const [key, value] of Object.entries(override)) {
    if (has(base, key) || value === null) continue;
    result[key] = clone(value);
  }
  return result;
}
