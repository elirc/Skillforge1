function toyHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

function constantTimeEquals(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i += 1) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

const CURRENT_ITERATIONS = 1000;

export function verifyPassword(stored: string, attempt: string): { ok: boolean; needsRehash: boolean } {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "toy1" || !/^\d+$/.test(parts[1])) return { ok: false, needsRehash: false };
  const iterations = Number(parts[1]);
  if (iterations < 1) return { ok: false, needsRehash: false };
  const [, , salt, expected] = parts;

  let hash = `${salt}:${attempt}`;
  for (let i = 0; i < iterations; i += 1) hash = toyHash(hash);

  const ok = constantTimeEquals(hash, expected);
  return { ok, needsRehash: ok && iterations < CURRENT_ITERATIONS };
}
