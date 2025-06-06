/**
 * Scroll to active lyric element automatically
 * @see {@link https://github.com/sglkc/moegi/issues/18#issuecomment-2645727922|GitHub}
 */
export default function lyricsAutoScroll() {
  // Active lyric class always at the end
  const observer = new MutationObserver((mutations) => {
    const activeLyric = mutations.at(-1)?.target

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
