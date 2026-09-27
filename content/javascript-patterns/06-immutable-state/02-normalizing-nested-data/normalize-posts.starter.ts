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
  // For each post: record its id in postIds, store every user once in `users`,
  // store each comment in `comments` with `author` replaced by the user id,
  // and store the post with `author` as an id and `comments` as a list of ids.
  return result;
}
