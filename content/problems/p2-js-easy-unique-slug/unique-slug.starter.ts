export function uniqueSlug(title: string, existing: string[]) {
  // 1. Slugify: lowercase, runs of non [a-z0-9] -> "-", trim dashes, "" -> "untitled".
  // 2. Return the base if free, else the first free base-2, base-3, ...
}
