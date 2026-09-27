interface SortTerm {
  field: string;
  direction: "asc" | "desc";
}

type ListQueryResult =
  | { ok: false; errors: string[] }
  | { ok: true; filters: { status?: string; search?: string }; sort: SortTerm[]; page: number; pageSize: number };

const SORTABLE = ["id", "name", "price", "createdAt"];
const STATUSES = ["active", "archived"];

function decode(part: string): string {
  return decodeURIComponent(part.replace(/\+/g, " "));
}

export function parseListQuery(search: string): ListQueryResult {
  const text = search.startsWith("?") ? search.slice(1) : search;
  const errors: string[] = [];
  let status: string | undefined;
  let term: string | undefined;
  let sort: SortTerm[] = [];
  let page = 1;
  let pageSize = 20;

  for (const pair of text.split("&")) {
    if (pair === "") continue;
    const eq = pair.indexOf("=");
    const key = decode(eq === -1 ? pair : pair.slice(0, eq));
    const value = eq === -1 ? "" : decode(pair.slice(eq + 1));
    if (key === "status") {
      if (STATUSES.includes(value)) status = value;
      else errors.push(`Invalid status '${value}'.`);
    } else if (key === "search") {
      const trimmed = value.trim();
      if (trimmed !== "") term = trimmed;
    } else if (key === "sort") {
      sort = [];
      for (const raw of value.split(",")) {
        const descending = raw.startsWith("-");
        const field = descending ? raw.slice(1) : raw;
        if (SORTABLE.includes(field)) sort.push({ field, direction: descending ? "desc" : "asc" });
        else errors.push(`Cannot sort by '${field}'.`);
      }
    } else if (key === "page" || key === "pageSize") {
      const n = /^\d+$/.test(value) ? Number(value) : 0;
      if (n < 1) errors.push(`${key} must be a positive integer.`);
      else if (key === "page") page = n;
      else pageSize = Math.min(n, 100);
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  if (!sort.some((s) => s.field === "id")) sort.push({ field: "id", direction: "asc" });
  const filters: { status?: string; search?: string } = {};
  if (status !== undefined) filters.status = status;
  if (term !== undefined) filters.search = term;
  return { ok: true, filters, sort, page, pageSize };
}
