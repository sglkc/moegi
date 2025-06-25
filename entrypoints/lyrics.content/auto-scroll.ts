import { LYRICS_CONTAINER, FULLSCREEN_CONTAINER } from '@/utils/constants'

let observer: MutationObserver | undefined

/**
 * Scroll to active lyric element automatically in both regular and fullscreen modes
 * @see {@link https://github.com/sglkc/moegi/issues/18#issuecomment-2645727922|GitHub}
 */
export default function lyricsAutoScroll() {
  if (observer) observer.disconnect()

  // Only scroll if the lyric changes, prevents jumping on song change
  // First element is inactive, second element is active
  observer = new MutationObserver((mutations) => {
    if (mutations.length !== 2) return

    const activeLyric = mutations[1].target

    if (!(activeLyric instanceof HTMLElement)) return

    activeLyric.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' })
  })

  // Assume everything is ok since its initialized after lyrics processing
  // Try to observe both regular and fullscreen containers
  const regularContainer = document.querySelector(LYRICS_CONTAINER)
  const fullscreenContainer = document.querySelector(FULLSCREEN_CONTAINER)

  if (regularContainer) {
    observer.observe(regularContainer, {
      childList: true,
      subtree: true,
      attributeFilter: ['class']
    })
  }

  if (fullscreenContainer) {
    observer.observe(fullscreenContainer, {
      childList: true,
      subtree: true,
      attributeFilter: ['class']
    })
  }
}

/**
 * Update auto-scroll to handle mode changes (regular <-> fullscreen)
 */
export function updateAutoScrollMode() {
  lyricsAutoScroll()
}
