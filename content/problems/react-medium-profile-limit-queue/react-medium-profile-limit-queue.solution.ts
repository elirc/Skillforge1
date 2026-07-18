type QueueItem = { id: string; text: string };

export function profileLimitQueue(items: QueueItem[], nextItem: QueueItem, maxItems: number): QueueItem[] {
  return [...items, nextItem].slice(-maxItems);
}
