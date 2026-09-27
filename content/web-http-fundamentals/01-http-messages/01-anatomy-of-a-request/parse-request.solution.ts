interface ParsedRequest {
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body: string;
}

export function parseRequest(raw: string): ParsedRequest {
  const split = raw.indexOf("\r\n\r\n");
  const head = split === -1 ? raw : raw.slice(0, split);
  const body = split === -1 ? "" : raw.slice(split + 4);
  const [requestLine, ...headerLines] = head.split("\r\n");
  const [method, target] = requestLine.split(" ");

  const questionMark = target.indexOf("?");
  const path = questionMark === -1 ? target : target.slice(0, questionMark);
  const query: Record<string, string> = {};
  if (questionMark !== -1) {
    for (const pair of target.slice(questionMark + 1).split("&")) {
      if (pair === "") continue;
      const eq = pair.indexOf("=");
      const key = eq === -1 ? pair : pair.slice(0, eq);
      const value = eq === -1 ? "" : pair.slice(eq + 1);
      query[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  }

  const headers: Record<string, string> = {};
  for (const line of headerLines) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const name = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    headers[name] = name in headers ? `${headers[name]}, ${value}` : value;
  }

  return { method: method.toUpperCase(), path, query, headers, body };
}
