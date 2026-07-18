export function productExceptSelf(numbers: number[]): number[] {
  const output = new Array(numbers.length).fill(1);
  let prefix = 1;
  for (let index = 0; index < numbers.length; index += 1) {
    output[index] = prefix;
    prefix *= numbers[index];
  }
  let suffix = 1;
  for (let index = numbers.length - 1; index >= 0; index -= 1) {
    output[index] *= suffix;
    suffix *= numbers[index];
  }
  return output;
}
