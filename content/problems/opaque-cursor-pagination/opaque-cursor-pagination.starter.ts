export type FeedItem = { id: number; createdAt: string };

export function paginate(items: FeedItem[], limit: number, cursor: string | null) {
  // Sort newest first (then higher id), decode and validate the cursor,
  // keep items strictly after it, take `limit`, and encode the next cursor.
}
