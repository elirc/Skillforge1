type Direction = "asc" | "desc";

// K extends keyof T restricts key to real property names of T, so
// sortBy(users, "nmae", "asc") is a compile error. item[key] has the indexed
// access type T[K]: the type of that property.
export function sortBy<T, K extends keyof T>(items: T[], key: K, direction: Direction) {
  // Return a NEW array sorted by item[key]:
  //   - numbers compare numerically, strings with localeCompare
  //   - "desc" reverses the order
  //   - items whose value is null or missing always go last, in either direction
  //   - equal values keep their original relative order (Array.prototype.sort is stable)
  // Do not mutate items.
}
