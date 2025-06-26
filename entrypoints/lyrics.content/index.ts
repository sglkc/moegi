import { defineContentScript } from '#imports'
import lyricsInit from './init'
import lyricsRomanization from './romanization'
import lyricsStyling from './styling'
import lyricsTranslation from './translation'
import { FULLSCREEN_CONTAINER, LYRIC_SELECTOR, LYRICS_CONTAINER, ORIGINAL_LYRIC } from '@/utils/constants'
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

    // Debounced version of initLyrics in case of multiple mutation
    const debouncedInitLyrics = debounce(lyricsInit, 1000)

    const lyricsObserver = new MutationObserver((mutations) => {
      // TODO: early returns for anything else for performance ig
      const addedNodes = mutations.reduce((val, mut) => val + mut.addedNodes.length, 0)
      if (!rootElement || !addedNodes) return

      // If there are lyrics, then there must be the container, simple
      // Also prevent infinite loop by tracking original lyrics element
      let container: HTMLDivElement | null

      // Detect fullscreen lyrics first
      container = rootElement.querySelector<HTMLDivElement>(`${FULLSCREEN_CONTAINER} ${LYRICS_CONTAINER}`)

      // Fallback to normal lyrics
      if (!container)
        container = rootElement.querySelector<HTMLDivElement>(LYRICS_CONTAINER)

      if (!container || container.querySelector('.'+ORIGINAL_LYRIC)) return

      console.log('Found uninitialized lyrics container, starting...')

      // Sometimes the lyrics doesn't show up instantly, probs network
      const intervalId = setInterval(() => {
        if (!container.querySelector(LYRIC_SELECTOR)) {
          console.error('Container found but no lyrics, restarting in 500ms...')
          return
        }

        debouncedInitLyrics()
        clearInterval(intervalId)
      }, 500)
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
