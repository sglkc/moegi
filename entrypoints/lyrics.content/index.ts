import { defineContentScript } from '#imports'
import { applyOptionChanges, claimOptionsApply } from './apply-options'
import { clearLyricsCache } from './cache'
import {
  containerHasUnprocessedLines,
  findLyricsContainer,
  planLyricsReinit,
  readNowPlayingTitle,
  stripStaleLyricExtras,
  type LyricsWatchState,
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

    // Title text is compared because Spotify edits it in place.
    let watch: LyricsWatchState = {
      lastSongTitle: '',
      lastFullscreen: null,
      pendingSong: false,
    }

    // Popup notifies over messaging and then writes storage. Both reach this
    // script; the second call would romanize/translate again and toast twice.
    let lastAppliedKey = ''

    function applyToPage(options: MoegiOptions, changes: DeepKeys<MoegiOptions>[]): void {
      if (!rootElement) return
      const { container } = findLyricsContainer(rootElement)
      if (!container) return

      const key = claimOptionsApply(lastAppliedKey, options)
      if (key === null) return
      lastAppliedKey = key

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

    // Re-query at fire time so a song change that swaps the line nodes
    // is processed, not the detached lines from when the title first changed.
    const debouncedInitLyrics = debounce(() => {
      if (!rootElement) return
      const { container } = findLyricsContainer(rootElement)
      if (!container) return
      void lyricsInit(container)
    }, 1000)

    function followLyrics(): void {
      if (!rootElement) return
      const { container, fullscreen } = findLyricsContainer(rootElement)
      const decision = planLyricsReinit(watch, {
        title: readNowPlayingTitle(rootElement),
        fullscreen,
        hasUnprocessed: container ? containerHasUnprocessedLines(container) : false,
        hasAnyLine: Boolean(container?.querySelector(LYRIC_SELECTOR)),
      })
      watch = decision.state
      if (decision.clearCache) clearLyricsCache()
      if (decision.stripStale && container) stripStaleLyricExtras(container)
      if (decision.init) {
        console.debug('Found lyrics container (fullscreen=%s), starting...', fullscreen)
        debouncedInitLyrics()
      }
    }

    const lyricsObserver = new MutationObserver(() => {
      followLyrics()
    })

    const intervalId = setInterval(() => {
      // @ts-expect-error: intended nullable at start
      rootElement = document.body.querySelector('#main')
      if (!rootElement) return

      lyricsObserver.observe(rootElement, { childList: true, subtree: true })
      clearInterval(intervalId)
      // Title text changes do not emit childList. Poll so a skip is noticed
      // before the old lyric nodes are swapped out.
      setInterval(followLyrics, 500)
    }, 500)
  }
})
