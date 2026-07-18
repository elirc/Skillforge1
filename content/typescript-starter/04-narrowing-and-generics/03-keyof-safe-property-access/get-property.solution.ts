export function getProperty<T, K extends keyof T>(item: T, key: K): T[K] {
  return item[key];
}
