type Variant = "primary" | "danger" | "ghost";

type ActionProps =
  | { as: "link"; label: string; href: string; external?: boolean; variant?: Variant }
  | { as: "button"; label: string; type?: "button" | "submit" | "reset"; disabled?: boolean; variant?: Variant };

interface ResolvedElement {
  tag: "a" | "button";
  className: string;
  text: string;
  attrs: Record<string, string | boolean>;
}

export function resolveActionElement(props: ActionProps): ResolvedElement {
  const variant = props.variant ?? "primary";
  const className = `btn btn-${variant}`;
  const text = props.label.trim();

  if (props.as === "link") {
    const attrs: Record<string, string | boolean> = { href: props.href };
    if (props.external) {
      attrs.target = "_blank";
      attrs.rel = "noopener noreferrer";
    }
    return { tag: "a", className, text, attrs };
  }

  return {
    tag: "button",
    className,
    text,
    attrs: { type: props.type ?? "button", disabled: props.disabled ?? false },
  };
}
