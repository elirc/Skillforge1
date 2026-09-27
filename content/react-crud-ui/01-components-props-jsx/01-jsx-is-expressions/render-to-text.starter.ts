interface RenderElement {
  type: string;
  props?: { children?: RenderNode };
}

type RenderNode = string | number | boolean | null | RenderElement | RenderNode[];

// A JSX tree is plain data: <p>Hi {name}</p> becomes
// { type: "p", props: { children: ["Hi ", "Ada"] } }.
// Return the text React would put on screen for `node`:
// - null, true, and false render nothing
// - strings render as-is (never parsed as HTML)
// - numbers render as text, INCLUDING 0
// - arrays render each child in order
// - an element (or fragment) renders its props.children; no children -> ""
export function renderToText(node: RenderNode) {
  return "";
}
