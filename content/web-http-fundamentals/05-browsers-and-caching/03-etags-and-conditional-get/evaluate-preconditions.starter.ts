interface Resource {
  etag: string; // e.g. "\"v7\"" (strong) or "W/\"v7\"" (weak)
  lastModified: string; // ISO timestamp, e.g. "2026-09-01T10:00:00.000Z"
}

// Evaluate conditional request headers (names are lowercase in `headers`).
//
// GET or HEAD -> return { status, headers: { ETag, "Last-Modified" } } where
//   ETag is resource.etag and Last-Modified is new Date(lastModified).toUTCString().
//   - If if-none-match is present, it decides alone (ignore if-modified-since):
//     split on ",", trim; "*" matches anything; otherwise compare WEAKLY
//     (drop a leading "W/" from both sides). Any match -> 304, else 200.
//   - Else if if-modified-since is present and Date.parse gives a number:
//     304 when the resource's lastModified, rounded DOWN to whole seconds,
//     is <= that date; else 200. (HTTP dates have one-second precision.)
//   - Otherwise 200.
//
// PUT, PATCH or DELETE (optimistic concurrency) -> return { status } only:
//   - no if-match header -> 428 (Precondition Required)
//   - if-match lists "*" or an ETag equal to resource.etag under STRONG
//     comparison (exact string; weak "W/" tags never match) -> 200 (go ahead)
//   - otherwise -> 412 (Precondition Failed: someone else changed it)
export function evaluatePreconditions(method: string, resource: Resource, headers: Record<string, string>) {
}
