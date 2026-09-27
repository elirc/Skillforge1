// The product list keeps its filters in the URL (?q=desk&sort=price&page=2) so
// reloads, the back button, and shared links all restore the same view.
// URLs are user input: parse defensively and fall back to defaults.
//
// Parse `search` (it may start with "?"; if a param repeats, the first wins) into
// state = { q, sort, dir, page, pageSize } (in that key order):
// - q: trimmed, default ""
// - sort: "createdAt" | "name" | "price", default "createdAt"
// - dir: "asc" | "desc", default "desc"
// - pageSize: 10, 20, or 50 written as plain digits, default 20
// - page: a whole number >= 1 written as plain digits, default 1, then clamped to totalPages
// totalPages = max(1, ceil(totalItems / pageSize)); hasPrev = page > 1; hasNext = page < totalPages.
// canonical: a URLSearchParams string with only NON-default values, in the order
// q, sort, dir, page, pageSize, prefixed with "?" (or "" when everything is default).
// Return { state, totalPages, hasPrev, hasNext, canonical }.
export function parseListParams(search: string, totalItems: number) {
  const params = new URLSearchParams(search);
  const page = Number(params.get("page") ?? 1);
  const pageSize = Number(params.get("pageSize") ?? 20);
  const totalPages = Math.ceil(totalItems / pageSize);
  return {
    state: { q: params.get("q") ?? "", sort: params.get("sort") ?? "createdAt", dir: params.get("dir") ?? "desc", page, pageSize },
    totalPages,
    hasPrev: page > 1,
    hasNext: page < totalPages,
    canonical: search,
  };
}
