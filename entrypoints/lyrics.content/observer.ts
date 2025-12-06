import { restoreLyricFromCache } from './cache'
import { LYRIC_SELECTOR } from '@/utils/constants'

let observer: MutationObserver | undefined

/**
 * Observes lyrics container for any changes in lyrics element
 *
 * - Restore custom elements on changes using eagerly cached data
 *   @see {@link https://github.com/sglkc/moegi/issues/29#issuecomment-3546748205|GitHub}
 *
 * Spotify adds new elements before removing old ones, so we use an eager
 * caching strategy: lyrics are cached immediately after processing in
 * romanization.ts and translation.ts, allowing instant restoration here.
 */
export default function lyricsObserver(container: HTMLElement) {
  if (observer) {
    observer.disconnect()
  }

  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length == 0) continue

      // Restore lyrics from cache when Spotify adds new elements
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement && node.matches(LYRIC_SELECTOR)) {
          restoreLyricFromCache(node)
        }
      })
    }
  })

  observer.observe(container, { childList: true, subtree: true })
}
