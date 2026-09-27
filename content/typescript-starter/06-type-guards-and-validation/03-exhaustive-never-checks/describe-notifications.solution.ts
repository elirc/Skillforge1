type Notification =
  | { kind: "comment"; author: string; postTitle: string }
  | { kind: "mention"; author: string }
  | { kind: "follow"; follower: string }
  | { kind: "digest"; count: number };

function unsupported(notification: never): string {
  return `Unsupported notification: ${(notification as { kind: string }).kind}`;
}

function describe(item: Notification): string {
  switch (item.kind) {
    case "comment":
      return `${item.author} commented on "${item.postTitle}"`;
    case "mention":
      return `${item.author} mentioned you`;
    case "follow":
      return `${item.follower} started following you`;
    case "digest":
      if (item.count === 0) return "No new activity";
      return item.count === 1 ? "1 new update" : `${item.count} new updates`;
    default:
      return unsupported(item);
  }
}

export function describeNotifications(items: Notification[]): string[] {
  return items.map(describe);
}
