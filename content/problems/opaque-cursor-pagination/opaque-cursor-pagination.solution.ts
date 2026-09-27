export type FeedItem = { id: number; createdAt: string };

type Page = { ids: number[]; nextCursor: string | null } | { error: string };

export function paginate(items: FeedItem[], limit: number, cursor: string | null): Page {
  const encode = (item: FeedItem) =>
    btoa(JSON.stringify({ c: item.createdAt, i: item.id }))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  const decode = (token: string): { c: string; i: number } | null => {
    try {
      const base64 = token.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
      const value = JSON.parse(atob(padded));
      if (value && typeof value.c === "string" && Number.isInteger(value.i)) return { c: value.c, i: value.i };
      return null;
    } catch {
      return null;
    }
  };

  const sorted = [...items].sort((a, b) =>
    a.createdAt === b.createdAt ? b.id - a.id : a.createdAt < b.createdAt ? 1 : -1,
  );

  let remaining = sorted;
  if (cursor !== null) {
    const position = decode(cursor);
    if (!position) return { error: "invalid cursor" };
    remaining = sorted.filter(
      (item) => item.createdAt < position.c || (item.createdAt === position.c && item.id < position.i),
    );
  }

  const page = remaining.slice(0, limit);
  const hasMore = remaining.length > limit;
  return { ids: page.map((item) => item.id), nextCursor: hasMore ? encode(page[page.length - 1]) : null };
}
