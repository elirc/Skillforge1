type Post = { id: string; liked: boolean; likeCount: number };

export function optimisticLike(post: Post) {
  // flip liked and adjust likeCount
}
