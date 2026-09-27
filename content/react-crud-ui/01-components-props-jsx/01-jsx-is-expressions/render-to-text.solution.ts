interface RenderElement {
  type: string;
  props?: { children?: RenderNode };
}

type RenderNode = string | number | boolean | null | RenderElement | RenderNode[];

export function renderToText(node: RenderNode): string {
  // null, true, and false are valid children that render nothing.
  if (node === null || typeof node === "boolean") return "";
  if (typeof node === "string") return node;
  // Numbers always render, including 0. That is why {count && <Badge />} can print "0".
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(renderToText).join("");
  // Elements and fragments render whatever their children render.
  return renderToText(node.props?.children ?? null);
}
