// Parse a Set-Cookie header value and flag risky settings for a session cookie.
// Example: "__Host-sid=abc123; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=3600"
//
// Split on ";" and trim each part. The first part is name=value (split at the
// FIRST "=", since values may contain "="). The rest are attributes whose names
// are case-insensitive:
//   Domain=x   -> domain (string, as given)
//   Path=x     -> path
//   Max-Age=n  -> maxAge (a number)
//   HttpOnly   -> httpOnly: true
//   Secure     -> secure: true
//   SameSite=x -> sameSite normalized to "Strict", "Lax" or "None" (any case in the header)
//   Anything else (Expires, Priority, ...) is ignored.
// Missing attributes: domain, path, maxAge, sameSite are null; httpOnly, secure are false.
//
// warnings (in this order, only those that apply):
//   "Missing HttpOnly"                          when httpOnly is false
//   "SameSite=None requires Secure"             when sameSite is "None" and secure is false
//   "__Host- cookies need Secure, Path=/ and no Domain"
//                                               when the name starts with "__Host-" and it
//                                               is not (secure && path === "/" && domain === null)
//
// Return { name, value, domain, path, maxAge, httpOnly, secure, sameSite, warnings } in that order.
export function parseSetCookie(header: string) {
}
