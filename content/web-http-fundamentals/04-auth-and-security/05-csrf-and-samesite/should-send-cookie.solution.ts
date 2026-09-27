interface CookieRule {
  sameSite: "Strict" | "Lax" | "None";
  secure: boolean;
}

interface BrowserRequest {
  pageSite: string;
  targetSite: string;
  method: string;
  topLevelNavigation: boolean;
  https: boolean;
}

export function shouldSendCookie(cookie: CookieRule, request: BrowserRequest): boolean {
  if (cookie.secure && !request.https) return false;
  if (cookie.sameSite === "None" && !cookie.secure) return false;
  if (request.pageSite === request.targetSite) return true;
  if (cookie.sameSite === "Strict") return false;
  if (cookie.sameSite === "Lax") {
    return request.topLevelNavigation && (request.method === "GET" || request.method === "HEAD");
  }
  return true;
}
