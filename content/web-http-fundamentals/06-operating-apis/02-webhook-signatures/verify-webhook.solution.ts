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

function constantTimeEquals(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

const TOLERANCE_SECONDS = 300;

export function verifyWebhook(
  secret: string,
  signatureHeader: string,
  rawBody: string,
  nowSeconds: number,
): { ok: true } | { ok: false; reason: string } {
  let timestamp: string | undefined;
  const signatures: string[] = [];
  for (const part of signatureHeader.split(",")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (key === "t") timestamp = value;
    else if (key === "v1") signatures.push(value);
  }
  if (timestamp === undefined || !/^\d+$/.test(timestamp) || signatures.length === 0) {
    return { ok: false, reason: "malformed signature header" };
  }
  if (Math.abs(nowSeconds - Number(timestamp)) > TOLERANCE_SECONDS) {
    return { ok: false, reason: "timestamp outside tolerance" };
  }
  const expected = toyHmac(secret, `${timestamp}.${rawBody}`);
  if (signatures.some((signature) => constantTimeEquals(signature, expected))) return { ok: true };
  return { ok: false, reason: "signature mismatch" };
}
