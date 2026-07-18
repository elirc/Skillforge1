type Page<T> = { items: T[]; nextCursor?: string };

export function accountMergePages<T>(pages: Page<T>[]): T[] {
  return pages.flatMap((page) => page.items);
}
