/** The server must also bind to loopback; Host headers are not authentication. */
export function isLocalRequest(request: Request): boolean {
  try {
    const url = new URL(request.url);
    const host = request.headers.get("host");
    const origin = request.headers.get("origin");
    if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) return false;
    if (!host || host !== url.host || !origin) return false;
    return new URL(origin).origin === url.origin && request.headers.get("sec-fetch-site") !== "cross-site";
  } catch { return false; }
}
