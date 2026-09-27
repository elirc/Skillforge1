export type SearchCount = { term: string; count: number };

type TrieNode = { children: Map<string, TrieNode>; count: number };

export function autocomplete(history: SearchCount[], queries: string[], k: number): string[][] {
  const newNode = (): TrieNode => ({ children: new Map(), count: 0 });
  const root = newNode();

  for (const { term, count } of history) {
    let node = root;
    for (const ch of term.toLowerCase()) {
      if (!node.children.has(ch)) node.children.set(ch, newNode());
      node = node.children.get(ch)!;
    }
    node.count += count;
  }

  function collect(node: TrieNode, word: string, out: SearchCount[]) {
    if (node.count > 0) out.push({ term: word, count: node.count });
    for (const [ch, child] of node.children) collect(child, word + ch, out);
  }

  return queries.map((query) => {
    const prefix = query.trim().toLowerCase();
    if (!prefix) return [];

    let node: TrieNode | undefined = root;
    for (const ch of prefix) {
      node = node.children.get(ch);
      if (!node) return [];
    }

    const matches: SearchCount[] = [];
    collect(node, prefix, matches);
    return matches
      .sort((a, b) => b.count - a.count || (a.term < b.term ? -1 : a.term > b.term ? 1 : 0))
      .slice(0, k)
      .map((match) => match.term);
  });
}
