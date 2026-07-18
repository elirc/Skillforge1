type QueueItem = { id: string; text: string };

export function settingsLimitQueue(items: QueueItem[], nextItem: QueueItem, maxItems: number): QueueItem[] {
  return [...items, nextItem].slice(-maxItems);
}
