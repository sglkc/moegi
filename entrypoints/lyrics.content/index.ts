import { defineContentScript } from '#imports'
import lyricsInit from './init'
import lyricsRomanization from './romanization'
import lyricsStyling from './styling'
import lyricsTranslation from './translation'
import { LYRIC_SELECTOR } from '@/utils/constants'
import { debounce } from '@/utils/debounce'
import { Background } from '@/utils/messaging'
import { optionsStorage } from '@/utils/storage'

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

    // Save latest options to session storage
    // Since there's only one listener allowed, re-register options
    // TODO: duplicate in `init.ts`
    Background.onMessage('applyOptions', ({ data }) => {
      sessionStorage.setItem('moegi_options', JSON.stringify(data))
      lyricsStyling(data)
      lyricsRomanization(data.romanization)
      lyricsTranslation(data.translation)
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
            node.matches(LYRIC_SELECTOR)
            || node.querySelector(LYRIC_SELECTOR)
          ) {
            console.log('Matching lyrics element added, initializing')
            debouncedInitLyrics()
            return
          }
        }
      }
    })

    const intervalId = setInterval(() => {
      // @ts-expect-error: intended nullable at start
      rootElement = document.body.querySelector('#main')

      if (!rootElement || !sessionStorage.getItem('moegi_options')) return

      lyricsObserver.observe(rootElement, { childList: true, subtree: true })
      clearInterval(intervalId)
    }, 500)
  }
})
