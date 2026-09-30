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
import type { DeepKeys } from '@/utils/deep-keys'
import { Background } from '@/utils/messaging'
import type { MoegiOptions } from '@/utils/options'
import { diffOptionChanges, FULL_OPTION_CHANGE_KEYS } from '@/utils/options-diff'

export default defineContentScript({
  matches: ['https://open.spotify.com/*'],
  main() {
    console.debug('registered lyrics content script')

    // Store react root element
    let rootElement: HTMLElement

    // Store fullscreen lyrics state
    let lastFullscreen: boolean | null = null

    function applyToPage(options: MoegiOptions, changes: DeepKeys<MoegiOptions>[]): void {
      if (!rootElement) return
      const { container } = findLyricsContainer(rootElement)
      if (!container) return

      const lyrics = container.querySelectorAll<HTMLDivElement>(
        `${LYRIC_SELECTOR}:has( > :not(:empty))`,
      )
      const keys = changes.length > 0 ? changes : FULL_OPTION_CHANGE_KEYS
      console.debug('Applying changes', keys, options)
      applyOptionChanges(keys, options, lyrics)
    }

    // Primary path: background forwards popup changes
    Background.onMessage('applyOptions', ({ data: { options, changes } }) => {
      applyToPage(options, changes)
    })

    // Backup path: storage write (survives SW message drops; slightly lagged)
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'sync') return
      const entry = changes.moegiOptions
      if (!entry || entry.newValue == null) return

      const next = entry.newValue as MoegiOptions
      const prev = entry.oldValue as MoegiOptions | undefined
      const keys = diffOptionChanges(prev, next)
      if (keys.length === 0) return
      applyToPage(next, keys)
    })

    // Debounced version of initLyrics in case of multiple mutation
    const debouncedInitLyrics = debounce(lyricsInit, 1000)

    const lyricsObserver = new MutationObserver((mutations) => {
      const addedNodes = mutations.reduce((val, mut) => val + mut.addedNodes.length, 0)
      if (!rootElement || !addedNodes) return

      // If mutations are lyrics initialization, skip
      const mutation = mutations[0]
      const added = mutation?.addedNodes[0]
      if (
        mutations.length === 1
          && mutation?.addedNodes.length === 1
          && added?.nodeName === '#text'
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
