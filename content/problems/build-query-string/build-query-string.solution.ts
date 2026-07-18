type QueryValue = string | number | boolean | undefined;

export function buildQueryString(params: Record<string, QueryValue>): string {
  return Object.keys(params)
    .filter((key) => params[key] !== undefined)
    .sort()
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(String(params[key]))}`)
    .join("&");
}
