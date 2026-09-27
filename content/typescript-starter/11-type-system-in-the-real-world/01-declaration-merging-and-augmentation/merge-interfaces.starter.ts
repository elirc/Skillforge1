interface Declaration {
  name: string;
  members: Record<string, string>; // property name -> type text
}

interface MergeResult {
  interfaces: Record<string, Record<string, string>>;
  errors: string[];
}

// TODO: declarations with the same name must MERGE (not replace each other).
// If a later declaration gives an existing property a different type, keep the
// first type and add this error:
//   "<Interface>.<prop>: subsequent declaration has type '<new>', expected '<old>'"
export function mergeInterfaces(declarations: Declaration[]): MergeResult {
  const interfaces: Record<string, Record<string, string>> = {};
  for (const declaration of declarations) {
    interfaces[declaration.name] = { ...declaration.members };
  }
  return { interfaces, errors: [] };
}
