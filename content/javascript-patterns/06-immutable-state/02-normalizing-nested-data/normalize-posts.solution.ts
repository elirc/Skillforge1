interface User {
  id: number;
  name: string;
}

interface Post {
  id: number;
  title: string;
  author: User;
  comments: { id: number; text: string; author: User }[];
}

interface Normalized {
  postIds: number[];
  posts: Record<number, { id: number; title: string; author: number; comments: number[] }>;
  comments: Record<number, { id: number; text: string; author: number }>;
  users: Record<number, User>;
}

export function normalizePosts(input: Post[]): Normalized {
  const result: Normalized = { postIds: [], posts: {}, comments: {}, users: {} };
  for (const post of input) {
    result.postIds.push(post.id);
    result.users[post.author.id] = { id: post.author.id, name: post.author.name };
    for (const comment of post.comments) {
      result.users[comment.author.id] = { id: comment.author.id, name: comment.author.name };
      result.comments[comment.id] = { id: comment.id, text: comment.text, author: comment.author.id };
    }
    result.posts[post.id] = {
      id: post.id,
      title: post.title,
      author: post.author.id,
      comments: post.comments.map((comment) => comment.id),
    };
  }
  return result;
}
