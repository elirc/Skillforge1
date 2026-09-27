type Notification =
  | { kind: "comment"; author: string; postTitle: string }
  | { kind: "mention"; author: string }
  | { kind: "follow"; follower: string }
  | { kind: "digest"; count: number };

// In the default branch of a switch over kind, the notification has type
// never, because every known kind was handled. If someone later adds a kind
// to the union and forgets a case, the call below stops compiling.
function unsupported(notification: never): string {
  // At runtime an older client can still receive a kind it does not know.
  return `Unsupported notification: ${(notification as { kind: string }).kind}`;
}

export function describeNotifications(items: Notification[]) {
  // Map each notification to a message:
  //   comment -> Ada commented on "Hello"
  //   mention -> Ada mentioned you
  //   follow  -> Grace started following you
  //   digest  -> "No new activity" (0), "1 new update" (1), "5 new updates" (5)
  //   default -> return unsupported(item)
}
