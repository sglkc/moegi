import { defineContentScript } from '#imports'
import lyricsInit from './init'
import lyricsRomanization from './romanization'
import lyricsStyling from './styling'
import lyricsTranslation from './translation'
import { LYRIC_SELECTOR } from '@/utils/constants'
import { debounce } from '@/utils/debounce'
import { createArrayHas } from '@/utils/deep-keys'
import { Background } from '@/utils/messaging'

export default defineContentScript({
  matches: ['https://open.spotify.com/*'],
  main() {
    console.log('registered lyrics content script')

    // Store react root element
    let rootElement: HTMLElement

    // Since there's only one listener allowed, re-register options
    // TODO: duplicate in `init.ts` ??
    Background.onMessage('applyOptions', ({ data: { options, changes } }) => {
      const has = createArrayHas(changes)
      console.log('Applying changes', changes, options)

      // Must have dependency options to prevent multiple reloads
      if (has(
        'fonts',
        'colors',
        'translation.enabled',
        'translation.size',
        'romanization.enabled',
        'romanization.size',
      )) {
        lyricsStyling(options)
      }

      if (has(
        'romanization.enabled',
        'romanization.language',
        'romanization.chinese',
        'romanization.cyrillic',
        'romanization.japanese',
        'romanization.korean',
      )) {
        lyricsRomanization(options.romanization)
      }

      if (has(
        'translation.enabled',
        'translation.target'
      )) {
        lyricsTranslation(options.translation)
      }
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
      if (!rootElement) return

      lyricsObserver.observe(rootElement, { childList: true, subtree: true })
      clearInterval(intervalId)
    }, 500)
  }
})
