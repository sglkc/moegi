import romanize from "./romanization"

export default defineContentScript({
  matches: ['https://open.spotify.com/*'],
  main() {
    console.log('registered lyrics content script')

    let rootElement: HTMLElement
    const lyricElements = new Set<HTMLElement>()

    // TODO: handle fullscreen page
    function checkLyricsPage(): boolean {
      return window.location.pathname.startsWith('/lyrics')
    }

    // Initialize lyrics detection and processing
    async function initLyrics(): Promise<void> {
      const toastId = await Content.sendMessage('createToast', {
        text: 'Processing lyrics...'
      })

      const elements = document.querySelectorAll(constants.LYRIC_SELECTOR)
      const lyrics = Array.from(elements) as HTMLElement[]

      if (lyrics.length === 0) {
        await Content.sendMessage('createToast', {
          text: 'No lyrics found',
          duration: 1000
        })
        return
      }

      // Clear previous elements and add new ones
      lyricElements.clear()

      for (const lyric of lyrics) {
        lyricElements.add(lyric)
        processLyricElement(lyric)
      }

      await Content.sendMessage('destroyToast', toastId)
      await Content.sendMessage('createToast', {
        text: `Found ${lyrics.length} lyric lines!`,
        duration: 1000
      })
    }

    function processLyricElement(element: HTMLElement): void {
      if (element.hasAttribute('data-moegi-processed')) return

      element.setAttribute('data-moegi-processed', 'true')

      const originalLyric = element.textContent?.trim() || ''

      if (!originalLyric) return

      // Clear existing content
      element.innerHTML = ''

      // Create containers for different lyric types
      const originalElement = document.createElement('p')
      originalElement.className = constants.ORIGINAL_LYRIC
      originalElement.textContent = originalLyric

      const romanizedElement = document.createElement('p')
      romanizedElement.className = constants.ROMANIZED_LYRIC
      romanizedElement.textContent = romanize(originalLyric)

      const translatedElement = document.createElement('p')
      translatedElement.className = constants.TRANSLATED_LYRIC

      // Add all elements to the container
      element.appendChild(originalElement)
      element.appendChild(romanizedElement)
      element.appendChild(translatedElement)
    }

    // Debounced version of initLyrics in case of multiple mutation
    const debouncedInitLyrics = debounce(initLyrics, 1000)

    const lyricsObserver = new MutationObserver((mutations) => {
      if (!rootElement || !checkLyricsPage()) return

      // There must be the lyrics element added
      for (const mutation of mutations) {
        if (!mutation.addedNodes.length) continue

        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue

          if (node.querySelector(constants.LYRIC_SELECTOR)) {
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

      if (!rootElement) return

      lyricsObserver.observe(rootElement, { childList: true, subtree: true })
      clearInterval(intervalId)
    }, 500)
  }
})
