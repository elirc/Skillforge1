export function isPalindrome(text: string): boolean {
  return text === [...text].reverse().join("");
}
