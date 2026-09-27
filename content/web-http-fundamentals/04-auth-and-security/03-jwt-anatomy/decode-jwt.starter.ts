// Decode a JWT (header.payload.signature) and check its time claims.
// This does NOT verify the signature: a real server must do that with its key
// BEFORE trusting any claim. Decoding only shows that anyone can read a JWT.
//
// Base64url alphabet (value 0..63, in order):
//   "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
// Decoding a segment:
//   - Ignore any trailing "=" padding. Any other character outside the alphabet is an error.
//   - Each character is 6 bits. Append them to a bit buffer; every time it holds
//     8 or more bits, take the top 8 as one byte. Leftover bits (fewer than 8) are dropped.
//   - The bytes are UTF-8. One way to decode them without TextDecoder: turn each byte
//     into "%" + two hex digits and call decodeURIComponent on the result.
//   - JSON.parse the text; the result must be a plain object.
//
// Return, checking in this order:
//   - token does not have exactly 3 dot-separated parts, or either of the first two
//     fails to decode -> { ok: false, reason: "malformed" }
//   - header.alg is "none" (any case) -> { ok: false, reason: "alg none is not allowed" }
//   - payload.exp is a number and nowSeconds >= exp -> { ok: false, reason: "expired" }
//   - payload.nbf is a number and nowSeconds < nbf -> { ok: false, reason: "not yet valid" }
//   - otherwise -> { ok: true, header, payload }
export function decodeJwt(token: string, nowSeconds: number) {
}
