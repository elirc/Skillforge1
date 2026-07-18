export function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  return `${name[0]}***@${domain}`;
}
