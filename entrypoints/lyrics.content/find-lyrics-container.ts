import {
  FULLSCREEN_CONTAINER,
  LYRICS_CONTAINER,
  SONG_TITLE,
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
