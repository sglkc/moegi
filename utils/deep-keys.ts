// Vibe coded with Claude Sonnet 4, shoutout to Copilot Student for providing free AI
type Primitive = string | number | boolean | null | undefined

// Helper type to limit recursion depth (max depth 5)
type Prev = [never, 0, 1, 2, 3, 4, 5]

/**
 * Extract deep keys with dot notation for objects
 */
export type DeepKeys<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends Primitive
  ? never
  : {
      [K in keyof T]-?: K extends string | number
        ? T[K] extends Primitive
          ? `${K}`
          : `${K}` | `${K}.${DeepKeys<T[K], Prev[D]>}`
        : never
    }[keyof T]

/**
 * Extract object into array of deep keys in dot notation
 */
export function getDeepKeys<T extends Record<string, any>>(
  obj: T,
  maxDepth: number = 10,
  prefix: string = ''
): DeepKeys<T>[] {
  if (maxDepth <= 0 || obj === null || typeof obj !== 'object') {
    return []
  }

  const keys: string[] = []

  for (const key in obj) {
    if (!(key in obj)) continue

    const currentPath = prefix ? `${prefix}.${key}` : key
    const value = obj[key]

    // Always include the current key
    keys.push(currentPath)

    // If value is an object (not primitive), recurse deeper
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const nestedKeys = getDeepKeys(value, maxDepth - 1, currentPath)
      keys.push(...nestedKeys)
    }
  }

  return keys as DeepKeys<T>[]
}

/**
 * Find if array has element of any of elements, because Set is not serializable :(
 */
export function createArrayHas<T>(array: T[]): (elements: T | T[]) => boolean {
  return (elements) => Array.isArray(elements)
    ? elements.some(element => array.includes(element))
    : array.includes(elements)
}
