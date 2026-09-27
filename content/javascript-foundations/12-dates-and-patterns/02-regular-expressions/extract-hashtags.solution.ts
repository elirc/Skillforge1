// A hashtag is "#" followed by one or more letters, digits, or underscores.
// Return each tag once, lowercased, without the "#", in the order first seen.
export function extractHashtags(text: string): string[] {
  const matches = text.match(/#\w+/g) ?? [];
  const tags: string[] = [];
  for (const match of matches) {
    const tag = match.slice(1).toLowerCase();
    if (!tags.includes(tag)) tags.push(tag);
  }
  return tags;
}
