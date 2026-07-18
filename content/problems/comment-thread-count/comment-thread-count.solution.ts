type CommentNode = { id: string; replies?: CommentNode[] };

export function commentThreadCount(comments: CommentNode[]): number {
  let count = 0;
  for (const comment of comments) {
    count += 1;
    count += commentThreadCount(comment.replies ?? []);
  }
  return count;
}
