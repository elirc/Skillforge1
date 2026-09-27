interface Declaration {
  name: string;
  members: Record<string, string>; // property name -> type text
}

interface MergeResult {
  interfaces: Record<string, Record<string, string>>;
  errors: string[];
}

export function mergeInterfaces(declarations: Declaration[]): MergeResult {
  const interfaces: Record<string, Record<string, string>> = {};
  const errors: string[] = [];

  for (const { name, members } of declarations) {
    const merged = interfaces[name] ?? {};
    for (const [prop, type] of Object.entries(members)) {
      const existing = Object.hasOwn(merged, prop) ? merged[prop] : undefined;
      if (existing === undefined) merged[prop] = type;
      else if (existing !== type) {
        errors.push(name + "." + prop + ": subsequent declaration has type '" + type + "', expected '" + existing + "'");
      }
    }
    interfaces[name] = merged;
  }

  return { interfaces, errors };
}
