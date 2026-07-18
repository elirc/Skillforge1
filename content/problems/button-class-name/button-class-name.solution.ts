type ButtonProps = { variant: "primary" | "secondary"; disabled?: boolean };

export function buttonClassName(props: ButtonProps): string {
  const base = `btn btn-${props.variant}`;
  return props.disabled ? `${base} btn-disabled` : base;
}
