interface Route {
  method: string;
  pattern: string; // e.g. "/users/:userId/orders/:orderId"
}

// Route a request the way a web framework's router does.
//
// - Split the pattern and the path on "/". A pattern segment starting with ":"
//   captures any non-empty path segment (decode it with decodeURIComponent);
//   other segments must match exactly (case-sensitive). Segment counts must match.
// - Ignore one trailing "/" on the path (but "/" itself stays "/").
// - Check routes in order. The first route whose pattern AND method match wins:
//     return { status: 200, pattern, params }
// - If some pattern matches the path but no route with that method exists:
//     return { status: 405, allow: [...methods of the matching patterns, in route order] }
// - If no pattern matches the path at all: return { status: 404 }
// Compare methods case-insensitively (routes are declared uppercase).
export function matchRoute(routes: Route[], method: string, path: string) {
}
