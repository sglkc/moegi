import { ORIGINAL_LYRIC } from '@/utils/constants'

/**
 * Cache for processed lyrics HTML, keyed by original lyric text.
 * This allows immediate restoration when Spotify removes and re-adds lyric elements.
 */
export const lyricsCache = new Map<string, string>()

/**
 * Save a lyric element's current HTML to the cache.
 * @param element The lyric line element containing original/romanized/translated children
 */
export function cacheLyricElement(element: HTMLElement): void {
  const originalText = element.querySelector('.' + ORIGINAL_LYRIC)?.textContent?.trim()
  if (originalText) {
    lyricsCache.set(originalText, element.innerHTML)
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
