type Post = { id: string; liked: boolean; likeCount: number };

export function optimisticLike(post: Post): Post {
  const liked = !post.liked;
  return { ...post, liked, likeCount: post.likeCount + (liked ? 1 : -1) };
}
