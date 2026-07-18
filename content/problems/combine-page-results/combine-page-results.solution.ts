type Page<T> = { items: T[]; nextCursor?: string };

export function combinePageResults<T>(pages: Page<T>[]): T[] {
  return pages.flatMap((page) => page.items);
}
