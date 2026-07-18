import { ORIGINAL_LYRIC } from '@/utils/constants'

/**
 * Cache for processed lyrics HTML, keyed by original lyric text.
 * This allows immediate restoration when Spotify removes and re-adds lyric elements.
 */
export const lyricsCache = new Map<string, string>()

const LYRICS_CACHE_LIMIT = 500

/**
 * Save a lyric element's current HTML to the cache.
 * @param element The lyric line element containing original/romanized/translated children
 */
export function cacheLyricElement(element: HTMLElement): void {
  const originalText = element.querySelector('.' + ORIGINAL_LYRIC)?.textContent?.trim()
  if (!originalText) return

  // Refresh insertion order for LRU-ish eviction
  if (lyricsCache.has(originalText)) {
    lyricsCache.delete(originalText)
  }
  lyricsCache.set(originalText, element.innerHTML)

  while (lyricsCache.size > LYRICS_CACHE_LIMIT) {
    const oldest = lyricsCache.keys().next().value
    if (oldest === undefined) break
    lyricsCache.delete(oldest)
  }
}

/**
 * Try to restore a lyric element from cache.
 */
export function restoreLyricFromCache(element: HTMLElement): boolean {
  const originalText = element.textContent?.trim()
  if (!originalText) return false

  const cachedHTML = lyricsCache.get(originalText)
  if (!cachedHTML) return false

  element.innerHTML = cachedHTML
  return true
}

/** Drop all cached lyric HTML (e.g. when the song changes). */
export function clearLyricsCache(): void {
  lyricsCache.clear()
}
