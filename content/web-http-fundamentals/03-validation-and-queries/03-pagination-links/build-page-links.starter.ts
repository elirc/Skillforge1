// Build the paging metadata for an offset-paged list endpoint.
//
// totalPages = ceil(totalCount / pageSize), but at least 1 (an empty list still has page 1).
//
// url(p) = baseUrl + ("&" if baseUrl already has a "?", else "?") + "page=<p>&pageSize=<pageSize>"
//
// link is an RFC 8288 Link header value: entries joined by ", ", each written as
//   <url>; rel="name"
// in this order:
//   first -> page 1 (always)
//   prev  -> only when page > 1: page - 1, or totalPages if page is past the end
//   next  -> only when page < totalPages: page + 1
//   last  -> totalPages (always)
//
// Return { totalPages, link }.
export function buildPageLinks(baseUrl: string, page: number, pageSize: number, totalCount: number) {
}
