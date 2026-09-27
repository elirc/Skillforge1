type PropValue = string | number | boolean | null | { ref: string };
type Props = Record<string, PropValue>;

interface ChildSpec {
  name: string;
  memo: boolean;
}

function samePropValue(a: PropValue, b: PropValue): boolean {
  const aIsRef = typeof a === "object" && a !== null;
  const bIsRef = typeof b === "object" && b !== null;
  if (aIsRef && bIsRef) return a.ref === b.ref;
  if (aIsRef || bIsRef) return false;
  return Object.is(a, b);
}

// React.memo's default comparison: same keys, and every value Object.is-equal.
function shallowEqual(prev: Props, next: Props): boolean {
  const prevKeys = Object.keys(prev);
  const nextKeys = Object.keys(next);
  if (prevKeys.length !== nextKeys.length) return false;
  return nextKeys.every((key) => key in prev && samePropValue(prev[key], next[key]));
}

export function childRenders(children: ChildSpec[], parentRenders: Record<string, Props>[]): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const child of children) {
    const rendered: number[] = [];
    let prevProps: Props | null = null;
    parentRenders.forEach((propsByChild, index) => {
      const props = propsByChild[child.name] ?? {};
      // Without memo a child renders whenever its parent renders.
      if (prevProps === null || !child.memo || !shallowEqual(prevProps, props)) rendered.push(index + 1);
      prevProps = props;
    });
    result[child.name] = rendered;
  }
  return result;
}
