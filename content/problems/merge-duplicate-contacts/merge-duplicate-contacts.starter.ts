type Contact = { id: string; email: string | null; phone: string | null };

export function mergeDuplicateContacts(contacts: Contact[]) {
  // 1. Normalize email and phone into comparable keys (or nothing).
  // 2. Join contacts that share a key, transitively (union-find works well).
  // 3. Return groups of ids in input order.
}
