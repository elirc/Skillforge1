type Page<T> = { items: T[]; nextCursor?: string };

export function userMergePages<T>(pages: Page<T>[]) {
  // combine items from every page
}
