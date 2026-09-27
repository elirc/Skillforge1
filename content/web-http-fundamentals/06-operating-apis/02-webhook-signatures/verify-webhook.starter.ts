// TOY stand-ins for HMAC-SHA256. The shape is what matters: the signature is a
// keyed hash of the RAW body, so only someone with the shared secret can make it.
function toyHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

function toyHmac(secret: string, message: string): string {
  return toyHash(secret + toyHash(secret + message));
}

// Verify an incoming webhook the way Stripe-style providers expect.
//
// signatureHeader looks like "t=1700000000,v1=9b89f5ce" and may carry several v1
// entries (during secret rotation): "t=1700000000,v1=aaaa,v1=bbbb".
// The signed message is `${t}.${rawBody}`: the timestamp, a dot, and the body
// EXACTLY as received (never a re-serialized JSON object).
//
// Return, checking in this order:
// - header has no t with only digits, or no v1 entry -> { ok: false, reason: "malformed signature header" }
// - |nowSeconds - t| > 300 -> { ok: false, reason: "timestamp outside tolerance" } (blocks replays)
// - some v1 equals toyHmac(secret, `${t}.${rawBody}`) -> { ok: true }
//   (compare in constant time: check every character instead of stopping early)
// - otherwise -> { ok: false, reason: "signature mismatch" }
export function verifyWebhook(secret: string, signatureHeader: string, rawBody: string, nowSeconds: number) {
}
