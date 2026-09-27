export function buildPageLinks(
  baseUrl: string,
  page: number,
  pageSize: number,
  totalCount: number,
): { totalPages: number; link: string } {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const separator = baseUrl.includes("?") ? "&" : "?";
  const url = (p: number) => `${baseUrl}${separator}page=${p}&pageSize=${pageSize}`;
  const entries: [string, number][] = [["first", 1]];
  if (page > 1) entries.push(["prev", Math.min(page - 1, totalPages)]);
  if (page < totalPages) entries.push(["next", page + 1]);
  entries.push(["last", totalPages]);
  const link = entries.map(([rel, p]) => `<${url(p)}>; rel="${rel}"`).join(", ");
  return { totalPages, link };
}
