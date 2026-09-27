type SameSite = "Strict" | "Lax" | "None";

interface ParsedCookie {
  name: string;
  value: string;
  domain: string | null;
  path: string | null;
  maxAge: number | null;
  httpOnly: boolean;
  secure: boolean;
  sameSite: SameSite | null;
  warnings: string[];
}

const SAME_SITE: Record<string, SameSite> = { strict: "Strict", lax: "Lax", none: "None" };

export function parseSetCookie(header: string): ParsedCookie {
  const [first, ...attributes] = header.split(";").map((part) => part.trim());
  const eq = first.indexOf("=");
  const cookie: ParsedCookie = {
    name: first.slice(0, eq).trim(),
    value: first.slice(eq + 1).trim(),
    domain: null,
    path: null,
    maxAge: null,
    httpOnly: false,
    secure: false,
    sameSite: null,
    warnings: [],
  };

  for (const attribute of attributes) {
    if (attribute === "") continue;
    const split = attribute.indexOf("=");
    const key = (split === -1 ? attribute : attribute.slice(0, split)).trim().toLowerCase();
    const value = split === -1 ? "" : attribute.slice(split + 1).trim();
    if (key === "domain") cookie.domain = value;
    else if (key === "path") cookie.path = value;
    else if (key === "max-age") cookie.maxAge = Number(value);
    else if (key === "httponly") cookie.httpOnly = true;
    else if (key === "secure") cookie.secure = true;
    else if (key === "samesite") cookie.sameSite = SAME_SITE[value.toLowerCase()] ?? null;
  }

  if (!cookie.httpOnly) cookie.warnings.push("Missing HttpOnly");
  if (cookie.sameSite === "None" && !cookie.secure) cookie.warnings.push("SameSite=None requires Secure");
  if (cookie.name.startsWith("__Host-") && !(cookie.secure && cookie.path === "/" && cookie.domain === null)) {
    cookie.warnings.push("__Host- cookies need Secure, Path=/ and no Domain");
  }
  return cookie;
}
