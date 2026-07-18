type Page<T> = { items: T[]; nextCursor?: string };

export function projectMergePages<T>(pages: Page<T>[]): T[] {
  return pages.flatMap((page) => page.items);
}
