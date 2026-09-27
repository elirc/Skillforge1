interface Resource {
  etag: string;
  lastModified: string;
}

type PreconditionResult = { status: number; headers: Record<string, string> } | { status: number };

function tagList(header: string): string[] {
  return header
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag !== "");
}

function stripWeak(tag: string): string {
  return tag.startsWith("W/") ? tag.slice(2) : tag;
}

export function evaluatePreconditions(method: string, resource: Resource, headers: Record<string, string>): PreconditionResult {
  if (method === "GET" || method === "HEAD") {
    const out = { ETag: resource.etag, "Last-Modified": new Date(resource.lastModified).toUTCString() };
    const ifNoneMatch = headers["if-none-match"];
    if (ifNoneMatch !== undefined) {
      const matched = tagList(ifNoneMatch).some((tag) => tag === "*" || stripWeak(tag) === stripWeak(resource.etag));
      return { status: matched ? 304 : 200, headers: out };
    }
    const since = headers["if-modified-since"] === undefined ? NaN : Date.parse(headers["if-modified-since"]);
    if (!Number.isNaN(since)) {
      const modifiedSeconds = Math.floor(Date.parse(resource.lastModified) / 1000) * 1000;
      return { status: modifiedSeconds <= since ? 304 : 200, headers: out };
    }
    return { status: 200, headers: out };
  }

  const ifMatch = headers["if-match"];
  if (ifMatch === undefined) return { status: 428 };
  const strongMatch = tagList(ifMatch).some(
    (tag) => tag === "*" || (!tag.startsWith("W/") && !resource.etag.startsWith("W/") && tag === resource.etag),
  );
  return { status: strongMatch ? 200 : 412 };
}
