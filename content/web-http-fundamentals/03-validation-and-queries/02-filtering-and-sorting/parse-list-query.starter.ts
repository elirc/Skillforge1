// Parse the query string of GET /products into a safe, allow-listed query.
// Example: "?status=active&search=desk+lamp&sort=-price,name&page=2&pageSize=50"
//
// - An optional leading "?" is ignored. Split on "&" and "="; decode each key and
//   value by turning "+" into a space, then calling decodeURIComponent.
// - status: must be "active" or "archived", else the error "Invalid status 'x'."
// - search: trimmed; ignore it if empty.
// - sort: comma-separated fields; a leading "-" means descending. Allowed fields:
//   id, name, price, createdAt. An unknown field adds the error "Cannot sort by 'x'."
//   (x without the "-"). Always end the sort list with { field: "id", direction: "asc" }
//   unless id is already in it, so paging is stable.
// - page: default 1. pageSize: default 20, capped at 100. Both must be all digits
//   and at least 1, else "page must be a positive integer." /
//   "pageSize must be a positive integer."
// - Any other parameter is ignored.
// Errors are listed in the order their parameters appear.
//
// Return { ok: false, errors } if there are errors, otherwise
// { ok: true, filters, sort, page, pageSize } where filters has status then search
// (each only when given) and sort is an array of { field, direction: "asc" | "desc" }.
export function parseListQuery(search: string) {
}
