// Parse a raw HTTP/1.1 request. Lines end with "\r\n"; a blank line separates
// the headers from the body.
//
//   GET /products?page=2&q=desk%20lamp HTTP/1.1\r\n
//   Host: shop.test\r\n
//   Accept: application/json\r\n
//   \r\n
//   <body>
//
// Return { method, path, query, headers, body } (in that key order):
// - method: from the request line, uppercased.
// - path: the target without its query string.
// - query: each "key=value" pair after "?", decoded with decodeURIComponent.
//   A key with no "=" gets "". Later duplicates overwrite earlier ones.
// - headers: names lowercased, values trimmed. A repeated header is joined
//   with ", " in the order it appeared.
// - body: everything after the first blank line ("" if there is none).
export function parseRequest(raw: string) {
  // Tip: split on the first "\r\n\r\n", then split the head into lines.
}
