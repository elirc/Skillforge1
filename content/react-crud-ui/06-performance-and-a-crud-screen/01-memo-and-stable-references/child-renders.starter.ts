// A function, object, array, or JSX value is written { ref: "id" }: the same
// ref means the same reference (e.g. from useCallback/useMemo); a new ref means
// it was created fresh during that render (e.g. an inline arrow function).
type PropValue = string | number | boolean | null | { ref: string };
type Props = Record<string, PropValue>;

interface ChildSpec {
  name: string;
  memo: boolean; // wrapped in React.memo?
}

// `parentRenders[i]` holds the props the parent passes to each child on its
// render i + 1 (a missing entry means {}). Every child renders on render 1.
// After that:
// - a child WITHOUT memo re-renders every time the parent renders
// - a memo child re-renders only when its props are not shallowly equal to the
//   previous render's props: different key count, or any value that differs by
//   Object.is (refs compare by id)
// Return, for each child in `children` order, the list of parent render numbers
// on which it rendered: { [name]: number[] }.
export function childRenders(children: ChildSpec[], parentRenders: Record<string, Props>[]) {
  const result: Record<string, number[]> = {};
  for (const child of children) {
    result[child.name] = parentRenders.map((_, index) => index + 1);
  }
  return result;
}
