type Page<T> = { items: T[]; nextCursor?: string };

export function teamMergePages<T>(pages: Page<T>[]): T[] {
  return pages.flatMap((page) => page.items);
}
