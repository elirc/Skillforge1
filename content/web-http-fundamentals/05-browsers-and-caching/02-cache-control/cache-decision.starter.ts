// Decide what a cache may do with a stored response, given its Cache-Control
// header, how many seconds old it is, and whether this is a SHARED cache
// (a CDN or proxy used by many users) or a PRIVATE one (a single browser).
//
// Parse the header: directives are separated by ","; trim each; names are
// case-insensitive; a value follows "=" (it may be wrapped in double quotes).
//
// Return one of "do-not-store" | "revalidate" | "fresh", checking in order:
// 1. no-store                               -> "do-not-store"
// 2. private, and the cache is shared       -> "do-not-store"
// 3. no-cache                               -> "revalidate" (may store, must check with the server first)
// 4. Lifetime: in a shared cache s-maxage wins when present; otherwise max-age.
//    No lifetime at all                     -> "revalidate"
// 5. ageSeconds < lifetime                  -> "fresh", else "revalidate"
export function cacheDecision(cacheControl: string, ageSeconds: number, sharedCache: boolean) {
}
