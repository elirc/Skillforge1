type QueryValue = string | QueryValue[] | { [key: string]: QueryValue };
type QueryObject = { [key: string]: QueryValue };

export function parseQuery(query: string): QueryObject {
  const blocked = new Set(["__proto__", "constructor", "prototype"]);
  const result: QueryObject = {};

  const decode = (text: string) => {
    const spaced = text.replace(/\+/g, " ");
    try {
      return decodeURIComponent(spaced);
    } catch {
      return spaced;
    }
  };
  const isPlainObject = (value: unknown): value is QueryObject =>
    typeof value === "object" && value !== null && !Array.isArray(value);

  const body = query.startsWith("?") ? query.slice(1) : query;
  for (const pair of body.split("&")) {
    if (!pair) continue;
    const eq = pair.indexOf("=");
    const key = decode(eq === -1 ? pair : pair.slice(0, eq));
    const value = decode(eq === -1 ? "" : pair.slice(eq + 1));

    const match = key.match(/^([^[\]]+)((?:\[[^[\]]*\])*)$/);
    const segments = match ? [match[1], ...Array.from(match[2].matchAll(/\[([^[\]]*)\]/g), (m) => m[1])] : [key];

    if (segments.some((segment) => blocked.has(segment))) continue;
    if (segments.slice(0, -1).some((segment) => segment === "")) continue;
    if (segments[0] === "") continue;

    let node: QueryObject | QueryValue[] = result;
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const isLast = i === segments.length - 1;

      if (isLast) {
        if (segment === "") (node as QueryValue[]).push(value);
        else (node as QueryObject)[segment] = value;
        break;
      }

      const wantArray = segments[i + 1] === "";
      const container = node as QueryObject;
      const existing = Object.prototype.hasOwnProperty.call(container, segment) ? container[segment] : undefined;
      const fits = wantArray ? Array.isArray(existing) : isPlainObject(existing);
      if (!fits) container[segment] = wantArray ? [] : {};
      node = container[segment] as QueryObject | QueryValue[];
    }
  }

  return result;
}
