import lyricsInit from './init'

export default defineContentScript({
  matches: ['https://open.spotify.com/*'],
  main() {
    console.log('registered lyrics content script')

    // Store react root element
    let rootElement: HTMLElement

    // Get latest options to apply on first open
    optionsStorage.getValue().then((storedOptions) => {
      sessionStorage.setItem('moegi_options', JSON.stringify(storedOptions))
    })

    // TODO: handle fullscreen page?
    function checkLyricsPage(): boolean {
      return window.location.pathname.startsWith('/lyrics')
    }

    // Debounced version of initLyrics in case of multiple mutation
    const debouncedInitLyrics = debounce(lyricsInit, 1000)

    const lyricsObserver = new MutationObserver((mutations) => {
      if (!rootElement || !checkLyricsPage()) return

      // There must be the lyrics element added
      for (const mutation of mutations) {
        if (!mutation.addedNodes.length) continue

        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue

          if (
            node.matches(constants.LYRIC_SELECTOR)
              || node.querySelector(constants.LYRIC_SELECTOR)
          ) {
            console.log('Matching lyrics element added, initializing')
            debouncedInitLyrics()
            return
          }
        }
      }
    })

    const intervalId = setInterval(() => {
      // @ts-ignore: intended nullable at start
      rootElement = document.body.querySelector('#main')

      if (!rootElement || !sessionStorage.getItem('moegi_options')) return

      lyricsObserver.observe(rootElement, { childList: true, subtree: true })
      clearInterval(intervalId)
    }, 500)
  }
})
