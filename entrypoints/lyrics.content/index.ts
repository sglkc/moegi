import { defineContentScript } from '#imports'
import lyricsInit from './init'
import lyricsRomanization from './romanization'
import lyricsStyling from './styling'
import lyricsTranslation from './translation'
import { LYRICS_CONTAINER } from '@/utils/constants'
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
      // Also prevent infinite loop by tracking initialization status
      const container = rootElement.querySelector<HTMLDivElement>(LYRICS_CONTAINER)
      if (!container || container.hasAttribute('moegi-initialized')) return

      console.log('Found uninitialized lyrics container, starting...')
      container.setAttribute('moegi-initialized', 'true')
      debouncedInitLyrics()
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
