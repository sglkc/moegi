/**
 * Scroll to active lyric element automatically
 * @see {@link https://github.com/sglkc/moegi/issues/18#issuecomment-2645727922|GitHub}
 */
export default function lyricsAutoScroll() {
  // Only scroll if the lyric changes, prevents jumping on song change
  // First element is inactive, second element is active
  const observer = new MutationObserver((mutations) => {
    console.log(mutations.length)
    if (mutations.length !== 2) return

    const activeLyric = mutations[1].target

    if (!(activeLyric instanceof HTMLElement)) return

    activeLyric.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' })
  })

  // Assume everything is ok since its initialized after lyrics processing
  const lyricsContainer = document.querySelector(constants.LYRIC_SELECTOR)!.parentElement!
  observer.observe(
    lyricsContainer,
    { childList: true, subtree: true, attributeFilter: ['class'] }
  )
}
