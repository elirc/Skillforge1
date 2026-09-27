type JsonObject = Record<string, unknown>;

type DecodeResult = { ok: false; reason: string } | { ok: true; header: JsonObject; payload: JsonObject };

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function base64UrlToText(segment: string): string {
  const trimmed = segment.replace(/=+$/, "");
  let buffer = 0;
  let bits = 0;
  let encoded = "";
  for (const char of trimmed) {
    const value = ALPHABET.indexOf(char);
    if (value === -1) throw new Error(`Invalid base64url character "${char}"`);
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      const byte = (buffer >> bits) & 0xff;
      encoded += `%${byte.toString(16).padStart(2, "0")}`;
    }
    buffer &= (1 << bits) - 1;
  }
  return decodeURIComponent(encoded);
}

function decodeSegment(segment: string): JsonObject {
  const parsed: unknown = JSON.parse(base64UrlToText(segment));
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error("Not an object");
  return parsed as JsonObject;
}

export function decodeJwt(token: string, nowSeconds: number): DecodeResult {
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, reason: "malformed" };
  let header: JsonObject;
  let payload: JsonObject;
  try {
    header = decodeSegment(parts[0]);
    payload = decodeSegment(parts[1]);
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (typeof header.alg === "string" && header.alg.toLowerCase() === "none") {
    return { ok: false, reason: "alg none is not allowed" };
  }
  if (typeof payload.exp === "number" && nowSeconds >= payload.exp) return { ok: false, reason: "expired" };
  if (typeof payload.nbf === "number" && nowSeconds < payload.nbf) return { ok: false, reason: "not yet valid" };
  return { ok: true, header, payload };
}
