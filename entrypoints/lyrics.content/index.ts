import { defineContentScript } from '#imports'
import lyricsInit from './init'
import lyricsRomanization from './romanization'
import lyricsStyling from './styling'
import lyricsTranslation from './translation'
import { ALBUM_ART, FULLSCREEN_CONTAINER, LYRIC_SELECTOR, LYRICS_CONTAINER } from '@/utils/constants'
import { debounce } from '@/utils/debounce'
import { createArrayHas } from '@/utils/deep-keys'
import { Background } from '@/utils/messaging'

export default defineContentScript({
  matches: ['https://open.spotify.com/*'],
  main() {
    console.log('registered lyrics content script')

    // Store react root element
    let rootElement: HTMLElement

    // Store fullscreen lyrics state
    let lastFullscreen: boolean | null

    // Store unique song by its album art because there are songs that are
    // re-released under the same name and artist
    let lastSong = ''

    // Since there's only one listener allowed, re-register options
    // TODO: duplicate in `init.ts` ??
    Background.onMessage('applyOptions', ({ data: { options, changes } }) => {
      let container = rootElement.querySelector<HTMLDivElement>(`${FULLSCREEN_CONTAINER} ${LYRICS_CONTAINER}`)
      if (!container)
        container = rootElement.querySelector<HTMLDivElement>(LYRICS_CONTAINER)!

      const lyrics = container.querySelectorAll<HTMLDivElement>(`${LYRIC_SELECTOR}:has( > :not(:empty))`)
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
        'romanization.chinese',
        'romanization.cyrillic',
        'romanization.japanese',
        'romanization.korean',
      )) {
        lyricsRomanization(lyrics, options.romanization)
      }

      if (has(
        'translation.enabled',
        'translation.target'
      )) {
        lyricsTranslation(lyrics, options.translation)
      }
    })

    // Debounced version of initLyrics in case of multiple mutation
    const debouncedInitLyrics = debounce(lyricsInit, 1000)

    const lyricsObserver = new MutationObserver((mutations) => {
      // TODO: early returns for anything else for performance ig
      const addedNodes = mutations.reduce((val, mut) => val + mut.addedNodes.length, 0)
      if (!rootElement || !addedNodes) return

      // If mutations are lyrics initialization, skip
      if (
        mutations.length === 1
          && mutations[0].addedNodes.length === 1
          && mutations[0].addedNodes[0].nodeName === '#text'
      ) return

      // If there are lyrics, then there must be the container, simple
      // Also prevent infinite loop by tracking original lyrics element
      // Detect fullscreen lyrics first
      let container = rootElement.querySelector<HTMLDivElement>(`${FULLSCREEN_CONTAINER} ${LYRICS_CONTAINER}`)
      let currentFullscreen = true

      // Fallback to normal lyrics
      if (!container) {
        container = rootElement.querySelector<HTMLDivElement>(LYRICS_CONTAINER)
        currentFullscreen = false
      }

      if (!container) return lastFullscreen = null

      // If song changed, force initialization
      let currentSong = rootElement.querySelector<HTMLImageElement>(ALBUM_ART)?.src ?? ''

      // When switching from fullscreen, normal lyrics might already
      // initialized and we need to refresh them
      if ((currentFullscreen === lastFullscreen) && (currentSong === lastSong)) return

      console.log('Found uninitialized lyrics container, starting...')
      lastFullscreen = currentFullscreen
      lastSong = currentSong

      // Sometimes the lyrics doesn't show up instantly, probs network
      let i = 0
      const intervalId = setInterval(() => {
        if (!container.querySelector(LYRIC_SELECTOR)) {
          console.debug('Container found but no lyrics, restarting in 500ms...')
          if (i > 10) clearInterval(intervalId)
          i++
          return
        }

        debouncedInitLyrics(container)
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
