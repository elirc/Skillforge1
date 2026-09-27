// A TOY hash (32-bit FNV-1a) standing in for a real password hash such as
// PBKDF2, bcrypt, scrypt or Argon2. Never use this for real passwords: it is
// fast and tiny, which is exactly what a password hash must NOT be.
function toyHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

// Verify a login attempt against a stored password record.
//
// stored has the form "toy1$<iterations>$<salt>$<hash>", e.g. "toy1$1000$q7Rz$e26fb2d4".
// To hash an attempt: start with salt + ":" + attempt, then apply toyHash
// `iterations` times (each round hashes the previous round's output).
//
// Return { ok, needsRehash }:
// - The record is invalid if it does not have exactly 4 "$"-separated parts,
//   the first part is not "toy1", or iterations is not a whole number >= 1.
//   An invalid record gives { ok: false, needsRehash: false }.
// - ok: the computed hash equals the stored hash. Compare in constant time:
//   look at every character (and the lengths) instead of returning at the
//   first difference, so response timing does not leak how much matched.
// - needsRehash: ok is true AND iterations < 1000 (our current policy). The app
//   would then re-hash the password with the new cost while it has the plain text.
export function verifyPassword(stored: string, attempt: string) {
}
