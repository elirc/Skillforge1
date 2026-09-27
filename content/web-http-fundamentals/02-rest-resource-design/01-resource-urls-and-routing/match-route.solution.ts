interface Route {
  method: string;
  pattern: string;
}

type RouteMatch =
  | { status: 200; pattern: string; params: Record<string, string> }
  | { status: 405; allow: string[] }
  | { status: 404 };

function matchPattern(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.split("/");
  const pathParts = path.split("/");
  if (patternParts.length !== pathParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i += 1) {
    const expected = patternParts[i];
    const actual = pathParts[i];
    if (expected.startsWith(":")) {
      if (actual === "") return null;
      params[expected.slice(1)] = decodeURIComponent(actual);
    } else if (expected !== actual) {
      return null;
    }
  }
  return params;
}

export function matchRoute(routes: Route[], method: string, path: string): RouteMatch {
  const normalized = path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
  const wanted = method.toUpperCase();
  const allow: string[] = [];
  for (const route of routes) {
    const params = matchPattern(route.pattern, normalized);
    if (!params) continue;
    if (route.method.toUpperCase() === wanted) return { status: 200, pattern: route.pattern, params };
    allow.push(route.method);
  }
  return allow.length > 0 ? { status: 405, allow } : { status: 404 };
}
