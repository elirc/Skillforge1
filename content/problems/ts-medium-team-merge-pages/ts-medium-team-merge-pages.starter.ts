type Page<T> = { items: T[]; nextCursor?: string };

export function teamMergePages<T>(pages: Page<T>[]) {
  // combine items from every page
}
