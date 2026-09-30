/**
 * Bounded translation cache helpers (pure; session storage is the store).
 */

export type TranslationCache = Record<string, string>

export const TRANSLATION_CACHE_LIMIT = 100

/** Build a stable cache key from song title + target language. */
export function translationCacheKey(title: string, to: string): string {
  return `${title}\0${to}`
}

/**
 * Insert/update an entry and evict oldest keys when over the limit.
 * Object key order is insertion order in modern JS engines.
 */
export function setTranslationCacheEntry(
  cache: TranslationCache,
  key: string,
  value: string,
  limit = TRANSLATION_CACHE_LIMIT,
): TranslationCache {
  // Re-insert so the key moves to the end (most recent)
  if (key in cache) {
    delete cache[key]
  }
  cache[key] = value

  const keys = Object.keys(cache)
  if (keys.length <= limit) return cache

  const excess = keys.length - limit
  for (let i = 0; i < excess; i++) {
    const stale = keys[i]
    if (stale !== undefined) delete cache[stale]
  }
  return cache
}

/**
 * Split a joined multi-line translation and require a 1:1 line count.
 * Returns null when the translator collapsed/expanded lines.
 */
export function splitTranslationLines(
  translated: string,
  expectedLines: number,
): string[] | null {
  if (expectedLines <= 0) return null
  const lines = translated.split('\n')
  if (lines.length !== expectedLines) return null
  return lines
}
