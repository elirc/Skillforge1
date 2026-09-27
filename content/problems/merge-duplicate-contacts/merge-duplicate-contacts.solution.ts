type Contact = { id: string; email: string | null; phone: string | null };

export function mergeDuplicateContacts(contacts: Contact[]): string[][] {
  function normalizeEmail(raw: string | null): string | null {
    const email = (raw ?? "").trim().toLowerCase();
    const at = email.lastIndexOf("@");
    if (at <= 0) return null;
    let local = email.slice(0, at);
    let domain = email.slice(at + 1);
    const plus = local.indexOf("+");
    if (plus !== -1) local = local.slice(0, plus);
    if (domain === "googlemail.com") domain = "gmail.com";
    if (domain === "gmail.com") local = local.replace(/\./g, "");
    return local ? `email:${local}@${domain}` : null;
  }

  function normalizePhone(raw: string | null): string | null {
    let digits = (raw ?? "").replace(/\D/g, "");
    if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
    return digits.length === 10 ? `phone:${digits}` : null;
  }

  const parent = contacts.map((_, i) => i);
  const find = (i: number): number => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  };
  const union = (a: number, b: number) => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent[Math.max(rootA, rootB)] = Math.min(rootA, rootB);
  };

  const owner = new Map<string, number>();
  contacts.forEach((contact, i) => {
    for (const key of [normalizeEmail(contact.email), normalizePhone(contact.phone)]) {
      if (key === null) continue;
      const first = owner.get(key);
      if (first === undefined) owner.set(key, i);
      else union(first, i);
    }
  });

  const groups = new Map<number, string[]>();
  contacts.forEach((contact, i) => {
    const root = find(i);
    const group = groups.get(root) ?? [];
    group.push(contact.id);
    groups.set(root, group);
  });
  return [...groups.values()];
}
