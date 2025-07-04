let observer: MutationObserver | undefined

/**
 * Scroll to active lyric element automatically
 * @see {@link https://github.com/sglkc/moegi/issues/18#issuecomment-2645727922|GitHub}
 */
export default function lyricsAutoScroll(container: HTMLElement) {
  if (observer) observer.disconnect()

  // Only scroll if the lyric changes, prevents jumping on song change
  // First element is inactive, second element is active
  observer = new MutationObserver((mutations) => {
    if (mutations.length !== 2) return

    const activeLyric = mutations[1].target

    if (!(activeLyric instanceof HTMLElement)) return

    activeLyric.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' })
  })

  observer.observe(
    container,
    { childList: true, subtree: true, attributeFilter: ['class'] }
  )
}
