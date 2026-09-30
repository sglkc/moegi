import {
  FULLSCREEN_CONTAINER,
  LYRIC_SELECTOR,
  LYRICS_CONTAINER,
  ORIGINAL_LYRIC,
  ROMANIZED_LYRIC,
  SONG_TITLE,
  TRANSLATED_LYRIC,
} from '@/utils/constants'

export interface LyricsContainerHit {
  container: HTMLElement | null
  /** true = cinema/fullscreen container, false = normal, null = none */
  fullscreen: boolean | null
}

/**
 * Prefer fullscreen/cinema lyrics container, else normal lyrics container.
 * Mirrors content-script detection used before lyricsInit.
 */
export function findLyricsContainer(root: ParentNode): LyricsContainerHit {
  const fs = root.querySelector<HTMLElement>(
    `${FULLSCREEN_CONTAINER} ${LYRICS_CONTAINER}`,
  )
  if (fs) return { container: fs, fullscreen: true }

  const normal = root.querySelector<HTMLElement>(LYRICS_CONTAINER)
  if (normal) return { container: normal, fullscreen: false }

  return { container: null, fullscreen: null }
}

/**
 * Whether Moegi should re-run lyricsInit for this mutation batch.
 * - Always reinit when the now-playing song changes
 * - Reinit when entering/leaving fullscreen (layout is a new tree)
 * - Skip when still in the same mode (avoid infinite re-init loops)
 */
export function shouldReinitLyrics(opts: {
  currentFullscreen: boolean | null
  lastFullscreen: boolean | null
  songChanged: boolean
}): boolean {
  if (opts.currentFullscreen === null) return false
  if (opts.songChanged) return true
  return opts.currentFullscreen !== opts.lastFullscreen
}

const NOW_PLAYING_TITLE = '[data-testid="context-item-info-title"]'

/** Player title. Spotify updates this text in place, which childList observers miss. */
export function readNowPlayingTitle(root: ParentNode): string {
  const specific = root.querySelector(NOW_PLAYING_TITLE)?.textContent?.trim()
  if (specific) return specific
  return root.querySelector(SONG_TITLE)?.textContent?.trim() ?? ''
}

/** A visible lyric line Spotify has not been given original/romanized/translated slots. */
export function containerHasUnprocessedLines(container: ParentNode): boolean {
  for (const line of container.querySelectorAll<HTMLElement>(LYRIC_SELECTOR)) {
    if (!line.textContent?.trim()) continue
    if (!line.querySelector('.' + ORIGINAL_LYRIC)) return true
  }
  return false
}

export function stripStaleLyricExtras(container: ParentNode): void {
  container.querySelectorAll('.' + ROMANIZED_LYRIC + ', .' + TRANSLATED_LYRIC)
    .forEach((el) => { el.textContent = '' })
}

export interface LyricsWatchState {
  lastSongTitle: string
  lastFullscreen: boolean | null
  /** Title already changed; wait until the new song's raw lines are mounted. */
  pendingSong: boolean
}

export interface LyricsWatchSnap {
  title: string
  fullscreen: boolean | null
  hasUnprocessed: boolean
  hasAnyLine: boolean
}

export interface LyricsWatchDecision {
  state: LyricsWatchState
  clearCache: boolean
  stripStale: boolean
  init: boolean
}

/**
 * Song changes update the player title before lyric nodes are replaced.
 * Reprocessing immediately would romanize the previous song again, so wait
 * until unprocessed lines for the new song are actually in the container.
 */
export function planLyricsReinit(
  state: LyricsWatchState,
  snap: LyricsWatchSnap,
): LyricsWatchDecision {
  if (snap.fullscreen === null) {
    return {
      state: { ...state, lastFullscreen: null },
      clearCache: false,
      stripStale: false,
      init: false,
    }
  }

  const titleChanged = snap.title.length > 0 && snap.title !== state.lastSongTitle
  const modeChanged = snap.fullscreen !== state.lastFullscreen
  let pendingSong = state.pendingSong || titleChanged
  const init = (pendingSong && snap.hasUnprocessed) || (modeChanged && snap.hasAnyLine)
  if (init) pendingSong = false

  return {
    state: {
      lastSongTitle: titleChanged ? snap.title : state.lastSongTitle,
      lastFullscreen: init || modeChanged ? snap.fullscreen : state.lastFullscreen,
      pendingSong,
    },
    clearCache: titleChanged,
    stripStale: titleChanged,
    init,
  }
}

/** Detect song title mutations (now-playing widget). */
export function mutationIndicatesSongChange(
  mutations: Iterable<{ target: Node }>,
): boolean {
  for (const mutation of mutations) {
    const el = mutation.target
    if (!(el instanceof Element)) continue
    const parent = el.parentElement?.parentElement
    if (parent?.matches?.(SONG_TITLE)) return true
    if (el.closest?.(SONG_TITLE)) return true
  }
  return false
}
