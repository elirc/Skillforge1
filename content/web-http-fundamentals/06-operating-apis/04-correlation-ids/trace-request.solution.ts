type Source = "traceparent" | "header" | "generated";

interface Trace {
  correlationId: string;
  source: Source;
  responseHeaders: Record<string, string>;
}

const TRACEPARENT = /^00-([0-9a-f]{32})-([0-9a-f]{16})-[0-9a-f]{2}$/;
const SAFE_ID = /^[A-Za-z0-9-]{1,64}$/;

function result(correlationId: string, source: Source): Trace {
  return { correlationId, source, responseHeaders: { "X-Correlation-Id": correlationId } };
}

export function traceRequest(headers: Record<string, string>, generatedId: string): Trace {
  const traceparent = TRACEPARENT.exec((headers["traceparent"] ?? "").trim());
  if (traceparent && !/^0+$/.test(traceparent[1]) && !/^0+$/.test(traceparent[2])) {
    return result(traceparent[1], "traceparent");
  }
  const incoming = (headers["x-correlation-id"] ?? "").trim();
  if (SAFE_ID.test(incoming)) return result(incoming, "header");
  return result(generatedId, "generated");
}
