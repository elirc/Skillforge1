interface Person {
  first: string;
  last: string;
}

export function fullName({ first, last }: Person): string {
  return `${first} ${last}`;
}
