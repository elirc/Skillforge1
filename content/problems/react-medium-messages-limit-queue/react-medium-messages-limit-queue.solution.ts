type QueueItem = { id: string; text: string };

export function messagesLimitQueue(items: QueueItem[], nextItem: QueueItem, maxItems: number): QueueItem[] {
  return [...items, nextItem].slice(-maxItems);
}
