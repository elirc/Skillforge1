export function extractDomain(url: string): string {
  let withoutProtocol = url;
  if (withoutProtocol.startsWith("https://")) withoutProtocol = withoutProtocol.slice(8);
  if (withoutProtocol.startsWith("http://")) withoutProtocol = withoutProtocol.slice(7);
  return withoutProtocol.split("/")[0];
}
