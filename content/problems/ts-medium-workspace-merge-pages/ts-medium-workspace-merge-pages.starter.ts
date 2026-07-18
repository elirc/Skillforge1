type Page<T> = { items: T[]; nextCursor?: string };

export function workspaceMergePages<T>(pages: Page<T>[]) {
  // combine items from every page
}
