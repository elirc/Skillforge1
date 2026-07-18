type PanelProps = { selected?: boolean; disabled?: boolean };

export function messagesPanelClass(props: PanelProps): string {
  let className = "panel";
  if (props.selected) className += " selected";
  if (props.disabled) className += " disabled";
  return className;
}
