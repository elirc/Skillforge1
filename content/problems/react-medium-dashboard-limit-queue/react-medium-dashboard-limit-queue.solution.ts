type QueueItem = { id: string; text: string };

export function dashboardLimitQueue(items: QueueItem[], nextItem: QueueItem, maxItems: number): QueueItem[] {
  return [...items, nextItem].slice(-maxItems);
}
