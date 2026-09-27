const SORTS = ["createdAt", "name", "price"] as const;
const PAGE_SIZES = [10, 20, 50];

type Sort = (typeof SORTS)[number];

interface ListState {
  q: string;
  sort: Sort;
  dir: "asc" | "desc";
  page: number;
  pageSize: number;
}

function positiveInt(raw: string | null): number | null {
  if (raw === null || !/^\d+$/.test(raw)) return null;
  const value = Number(raw);
  return value >= 1 ? value : null;
}

export function parseListParams(
  search: string,
  totalItems: number,
): { state: ListState; totalPages: number; hasPrev: boolean; hasNext: boolean; canonical: string } {
  const params = new URLSearchParams(search);

  const q = (params.get("q") ?? "").trim();
  const rawSort = params.get("sort");
  const sort: Sort = SORTS.find((s) => s === rawSort) ?? "createdAt";
  const dir = params.get("dir") === "asc" ? "asc" : "desc";
  const size = positiveInt(params.get("pageSize"));
  const pageSize = size !== null && PAGE_SIZES.includes(size) ? size : 20;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(positiveInt(params.get("page")) ?? 1, totalPages);

  // Only non-default values go in the URL, in a fixed order, so equal states share one URL.
  const out = new URLSearchParams();
  if (q) out.set("q", q);
  if (sort !== "createdAt") out.set("sort", sort);
  if (dir !== "desc") out.set("dir", dir);
  if (page !== 1) out.set("page", String(page));
  if (pageSize !== 20) out.set("pageSize", String(pageSize));
  const query = out.toString();

  return {
    state: { q, sort, dir, page, pageSize },
    totalPages,
    hasPrev: page > 1,
    hasNext: page < totalPages,
    canonical: query ? `?${query}` : "",
  };
}
