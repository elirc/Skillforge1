/**
 * Pure helpers for the `/reviews?tag=<tag>` concept filter. Tags are compared
 * case-insensitively after trimming; a leading "#" in the URL is tolerated.
 */

export type TagSearchParam = string | string[] | undefined;

/** Reads the first `tag` search param value and normalizes it; returns null when absent or blank. */
export function normalizeTagParam(value: TagSearchParam): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string") return null;
  const tag = raw.trim().replace(/^#+/, "").trim().toLowerCase();
  return tag === "" ? null : tag;
}

/** True when `tags` contains `tag` (case-insensitive). */
export function hasConceptTag(tags: readonly string[], tag: string): boolean {
  const wanted = tag.trim().toLowerCase();
  return tags.some((candidate) => candidate.trim().toLowerCase() === wanted);
}

/**
 * Keeps only items whose knowledge item carries `tag`. A null tag means "no
 * filter" and returns the input unchanged. Order is preserved.
 */
export function filterByConceptTag<T extends { knowledgeItem: { conceptTags: readonly string[] } }>(
  items: readonly T[],
  tag: string | null,
): T[] {
  if (tag === null) return [...items];
  return items.filter((item) => hasConceptTag(item.knowledgeItem.conceptTags, tag));
}

/** Link to the review queue filtered to one concept tag. */
export function reviewTagHref(tag: string): string {
  return `/reviews?tag=${encodeURIComponent(tag)}`;
}
