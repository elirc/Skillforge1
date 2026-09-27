export type SearchCount = { term: string; count: number };

export function autocomplete(history: SearchCount[], queries: string[], k: number) {
  // Insert every lowercase term into a trie (adding counts), then for each
  // prefix collect the terms under its node, sort, and keep the top k.
}
