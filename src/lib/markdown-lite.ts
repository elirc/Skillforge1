/**
 * A deliberately tiny markdown subset for lesson prose: paragraphs split on
 * blank lines, "- " bullet lists, inline `code` and **bold**. It parses to a
 * plain tree that React renders as elements, so there is no HTML string and
 * no dangerouslySetInnerHTML anywhere -- authored text can never inject markup.
 * Anything it does not recognise (an unclosed backtick, a lone `**`) stays
 * literal text.
 */

export type InlineNode = { type: "text"; text: string } | { type: "code"; text: string } | { type: "bold"; children: InlineNode[] };

export type MarkdownBlock = { type: "paragraph"; children: InlineNode[] } | { type: "list"; items: InlineNode[][] };

function parseBold(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let rest = text;
  while (rest.length > 0) {
    const open = rest.indexOf("**");
    const close = open === -1 ? -1 : rest.indexOf("**", open + 2);
    if (open === -1 || close === -1 || close === open + 2) {
      nodes.push({ type: "text", text: rest });
      break;
    }
    if (open > 0) nodes.push({ type: "text", text: rest.slice(0, open) });
    nodes.push({ type: "bold", children: [{ type: "text", text: rest.slice(open + 2, close) }] });
    rest = rest.slice(close + 2);
  }
  return nodes;
}

/** Code spans win over bold: `**not bold**` inside backticks stays literal. */
export function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let rest = text;
  let pendingText = "";

  const flush = () => {
    if (pendingText) nodes.push(...parseBold(pendingText));
    pendingText = "";
  };

  while (rest.length > 0) {
    const open = rest.indexOf("`");
    const close = open === -1 ? -1 : rest.indexOf("`", open + 1);
    if (open === -1 || close === -1) {
      pendingText += rest;
      break;
    }
    pendingText += rest.slice(0, open);
    const code = rest.slice(open + 1, close);
    if (code.length === 0) {
      pendingText += "``";
    } else {
      flush();
      nodes.push({ type: "code", text: code });
    }
    rest = rest.slice(close + 1);
  }
  flush();

  return mergeText(nodes);
}

function mergeText(nodes: InlineNode[]): InlineNode[] {
  const merged: InlineNode[] = [];
  for (const node of nodes) {
    const last = merged[merged.length - 1];
    if (node.type === "text" && last?.type === "text") {
      merged[merged.length - 1] = { type: "text", text: last.text + node.text };
    } else if (node.type !== "text" || node.text.length > 0) {
      merged.push(node);
    }
  }
  return merged;
}

const bullet = /^\s*-\s+/;

export function parseMarkdownLite(source: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const chunks = source.replace(/\r\n?/g, "\n").split(/\n\s*\n/);

  for (const chunk of chunks) {
    const paragraph: string[] = [];
    const list: string[] = [];

    const flushParagraph = () => {
      if (paragraph.length > 0) blocks.push({ type: "paragraph", children: parseInline(paragraph.join(" ")) });
      paragraph.length = 0;
    };
    const flushList = () => {
      if (list.length > 0) blocks.push({ type: "list", items: list.map((item) => parseInline(item)) });
      list.length = 0;
    };

    for (const rawLine of chunk.split("\n")) {
      const line = rawLine.trim();
      if (!line) continue;
      if (bullet.test(rawLine)) {
        flushParagraph();
        list.push(rawLine.replace(bullet, "").trim());
      } else if (list.length > 0 && /^\s{2,}/.test(rawLine)) {
        // An indented continuation line belongs to the previous bullet.
        list[list.length - 1] += ` ${line}`;
      } else {
        flushList();
        paragraph.push(line);
      }
    }
    flushParagraph();
    flushList();
  }

  return blocks;
}
