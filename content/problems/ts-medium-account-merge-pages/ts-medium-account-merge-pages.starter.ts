type Page<T> = { items: T[]; nextCursor?: string };

export function accountMergePages<T>(pages: Page<T>[]) {
  // combine items from every page
}
