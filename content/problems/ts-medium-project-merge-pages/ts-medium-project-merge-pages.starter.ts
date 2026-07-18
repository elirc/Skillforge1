type Page<T> = { items: T[]; nextCursor?: string };

export function projectMergePages<T>(pages: Page<T>[]) {
  // combine items from every page
}
