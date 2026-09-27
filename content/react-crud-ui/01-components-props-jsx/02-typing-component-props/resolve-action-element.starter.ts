type Variant = "primary" | "danger" | "ghost";

// A discriminated union of props: `as` decides which other props are allowed,
// so <Action as="link" disabled /> is a compile error.
type ActionProps =
  | { as: "link"; label: string; href: string; external?: boolean; variant?: Variant }
  | { as: "button"; label: string; type?: "button" | "submit" | "reset"; disabled?: boolean; variant?: Variant };

// Return what the <Action> component would render, as data, with keys in this order:
// { tag, className, text, attrs }
// - className: "btn btn-<variant>", variant defaults to "primary"
// - text: the label, trimmed
// - link   -> tag "a", attrs { href } plus, when external is true,
//             target "_blank" and rel "noopener noreferrer" (in that order)
// - button -> tag "button", attrs { type, disabled }; type defaults to "button"
//             (NOT the browser default "submit") and disabled defaults to false
export function resolveActionElement(props: ActionProps) {
  const variant = props.variant;
  return { tag: props.as, className: `btn btn-${variant}`, text: props.label, attrs: {} };
}
