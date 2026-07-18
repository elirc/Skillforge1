type CommentNode = { id: string; replies?: CommentNode[] };

export function commentThreadCount(comments: CommentNode[]) {
  // count top-level comments and all nested replies
}
