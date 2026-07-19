import { defineContentScript } from '#imports'
import { applyOptionChanges } from './apply-options'
import { clearLyricsCache } from './cache'
import {
  findLyricsContainer,
  mutationIndicatesSongChange,
  shouldReinitLyrics,
} from './find-lyrics-container'
import lyricsInit from './init'
import { LYRIC_SELECTOR } from '@/utils/constants'
import { debounce } from '@/utils/debounce'
import { Background } from '@/utils/messaging'

export default defineContentScript({
  matches: ['https://open.spotify.com/*'],
  main() {
    console.debug('registered lyrics content script')

    // Store react root element
    let rootElement: HTMLElement

    // Store fullscreen lyrics state
    let lastFullscreen: boolean | null = null

    // Since there's only one listener allowed, re-register options
    Background.onMessage('applyOptions', ({ data: { options, changes } }) => {
      if (!rootElement) return
      const { container } = findLyricsContainer(rootElement)
      if (!container) return

      const lyrics = container.querySelectorAll<HTMLDivElement>(
        `${LYRIC_SELECTOR}:has( > :not(:empty))`,
      )
      console.debug('Applying changes', changes, options)
      applyOptionChanges(changes, options, lyrics)
    })

    // Debounced version of initLyrics in case of multiple mutation
    const debouncedInitLyrics = debounce(lyricsInit, 1000)

    const lyricsObserver = new MutationObserver((mutations) => {
      const addedNodes = mutations.reduce((val, mut) => val + mut.addedNodes.length, 0)
      if (!rootElement || !addedNodes) return

      // If mutations are lyrics initialization, skip
      if (
        mutations.length === 1
          && mutations[0].addedNodes.length === 1
          && mutations[0].addedNodes[0].nodeName === '#text'
      ) return

      const { container, fullscreen: currentFullscreen } = findLyricsContainer(rootElement)
      if (!container || currentFullscreen === null) {
        lastFullscreen = null
        return
      }

      const songChanged = mutationIndicatesSongChange(mutations)

      if (!shouldReinitLyrics({
        currentFullscreen,
        lastFullscreen,
        songChanged,
      })) return

      if (songChanged) clearLyricsCache()

      console.debug(
        'Found lyrics container (fullscreen=%s), starting...',
        currentFullscreen,
      )
      lastFullscreen = currentFullscreen

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
