interface CookieRule {
  sameSite: "Strict" | "Lax" | "None";
  secure: boolean;
}

interface BrowserRequest {
  pageSite: string; // the site of the page that started the request, e.g. "evil.test"
  targetSite: string; // the site the request goes to, e.g. "bank.test"
  method: string; // uppercase
  topLevelNavigation: boolean; // true for clicking a link / submitting a form that navigates the tab
  https: boolean;
}

// Model how a browser decides whether to attach a cookie to a request.
// This is why SameSite is the first line of defense against CSRF.
// Check in this order:
// 1. A Secure cookie is never sent over plain http -> false.
// 2. SameSite=None without Secure is rejected by browsers -> false.
// 3. Same-site request (pageSite === targetSite) -> true.
// 4. Cross-site with Strict -> false.
// 5. Cross-site with Lax -> true only for a top-level navigation using GET or HEAD.
// 6. Cross-site with None -> true.
export function shouldSendCookie(cookie: CookieRule, request: BrowserRequest) {
}
