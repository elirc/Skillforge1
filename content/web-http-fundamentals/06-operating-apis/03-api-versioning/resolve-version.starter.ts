interface VersionedRequest {
  path: string; // e.g. "/v2/products/7" or "/products/7"
  headers: Record<string, string>; // lowercase names
  query: Record<string, string>;
}

interface VersionPolicy {
  supported: string[]; // e.g. ["1", "2", "3"]
  deprecated: string[]; // still served, but clients should move off them
  defaultVersion: string; // used when the client does not say
}

// Work out which API version a request wants. A client may say it in up to three places:
//   - the path prefix "/v<digits>" (the segment right after the first "/", e.g. "/v2/products")
//   - the "api-version" header
//   - the "api-version" query parameter
// Values are trimmed; empty values count as not given.
//
// - If the given values disagree -> { status: 400, error: "Conflicting API versions" }
// - If none is given, use policy.defaultVersion.
// - If the version is not in supported ->
//     { status: 400, error: "Unsupported API version '<v>'. Supported: <supported joined with ', '>" }
// - Otherwise -> { status: 200, version, deprecated, path } where deprecated says whether
//   it is in policy.deprecated and path is the request path with any "/v<digits>" prefix
//   removed ("/v2" alone becomes "/").
export function resolveVersion(request: VersionedRequest, policy: VersionPolicy) {
}
