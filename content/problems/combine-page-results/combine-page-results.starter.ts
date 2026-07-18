type Page<T> = { items: T[]; nextCursor?: string };

export function combinePageResults<T>(pages: Page<T>[]) {
  // flatten all page items in order
}
