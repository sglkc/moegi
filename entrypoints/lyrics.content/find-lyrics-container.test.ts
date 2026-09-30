import { beforeEach, describe, expect, it } from 'vitest'
import {
  containerHasUnprocessedLines,
  findLyricsContainer,
  mutationIndicatesSongChange,
  planLyricsReinit,
  readNowPlayingTitle,
  shouldReinitLyrics,
  type LyricsWatchState,
} from './find-lyrics-container'
import { FULLSCREEN_CONTAINER, LYRICS_CONTAINER, SONG_TITLE } from '@/utils/constants'

describe('findLyricsContainer (fullscreen vs normal)', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('returns null when no lyrics containers exist', () => {
    const root = document.createElement('div')
    document.body.appendChild(root)
    expect(findLyricsContainer(root)).toEqual({
      container: null,
      fullscreen: null,
    })
  })

  it('prefers fullscreen/cinema container over normal', () => {
    const root = document.createElement('div')
    const cinema = document.createElement('div')
    cinema.setAttribute('style', '--cinema-mode:1')
    const fsLyrics = document.createElement('div')
    fsLyrics.setAttribute('style', '--lyrics-color-active:#fff')
    fsLyrics.id = 'fs'
    cinema.appendChild(fsLyrics)

    const normal = document.createElement('div')
    normal.setAttribute('style', '--lyrics-color-active:#000')
    normal.id = 'normal'

    root.append(cinema, normal)
    document.body.appendChild(root)

    // Constants: FULLSCREEN_CONTAINER = [style^=--cinema], LYRICS_CONTAINER = [style^=--lyrics]
    expect(FULLSCREEN_CONTAINER).toBe('[style^=--cinema]')
    expect(LYRICS_CONTAINER).toBe('[style^=--lyrics]')

    const hit = findLyricsContainer(root)
    expect(hit.fullscreen).toBe(true)
    expect(hit.container?.id).toBe('fs')
  })

  it('falls back to normal lyrics container', () => {
    const root = document.createElement('div')
    const normal = document.createElement('div')
    normal.setAttribute('style', '--lyrics-color-active:#000')
    normal.id = 'normal'
    root.appendChild(normal)
    document.body.appendChild(root)

    const hit = findLyricsContainer(root)
    expect(hit.fullscreen).toBe(false)
    expect(hit.container?.id).toBe('normal')
  })
})

describe('shouldReinitLyrics (fullscreen mode transitions)', () => {
  it('skips when no container (fullscreen null)', () => {
    expect(shouldReinitLyrics({
      currentFullscreen: null,
      lastFullscreen: false,
      songChanged: false,
    })).toBe(false)
  })

  it('skips when staying in the same mode', () => {
    expect(shouldReinitLyrics({
      currentFullscreen: false,
      lastFullscreen: false,
      songChanged: false,
    })).toBe(false)
    expect(shouldReinitLyrics({
      currentFullscreen: true,
      lastFullscreen: true,
      songChanged: false,
    })).toBe(false)
  })

  it('reinits when entering fullscreen', () => {
    expect(shouldReinitLyrics({
      currentFullscreen: true,
      lastFullscreen: false,
      songChanged: false,
    })).toBe(true)
  })

  it('reinits when leaving fullscreen', () => {
    expect(shouldReinitLyrics({
      currentFullscreen: false,
      lastFullscreen: true,
      songChanged: false,
    })).toBe(true)
  })

  it('reinits on first discovery (lastFullscreen null)', () => {
    expect(shouldReinitLyrics({
      currentFullscreen: false,
      lastFullscreen: null,
      songChanged: false,
    })).toBe(true)
  })

  it('always reinits when the song changes', () => {
    expect(shouldReinitLyrics({
      currentFullscreen: false,
      lastFullscreen: false,
      songChanged: true,
    })).toBe(true)
  })
})

describe('mutationIndicatesSongChange', () => {
  it('detects mutations under the now-playing widget', () => {
    const widget = document.createElement('div')
    widget.setAttribute('data-testid', 'now-playing-widget')
    expect(SONG_TITLE).toBe('[data-testid="now-playing-widget"]')
    const mid = document.createElement('div')
    const leaf = document.createElement('span')
    mid.appendChild(leaf)
    widget.appendChild(mid)
    document.body.appendChild(widget)

    expect(mutationIndicatesSongChange([{ target: leaf }])).toBe(true)
  })

  it('returns false for unrelated targets', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    expect(mutationIndicatesSongChange([{ target: el }])).toBe(false)
  })
})

describe('song change waits for the new lines', () => {
  const idle: LyricsWatchState = {
    lastSongTitle: 'Futari Goto',
    lastFullscreen: false,
    pendingSong: false,
  }

  it('reads the player title Spotify updates in place', () => {
    const root = document.createElement('div')
    const widget = document.createElement('div')
    widget.setAttribute('data-testid', 'now-playing-widget')
    widget.textContent = 'widget title'
    const title = document.createElement('span')
    title.setAttribute('data-testid', 'context-item-info-title')
    title.textContent = 'Summer love'
    root.append(widget, title)
    expect(readNowPlayingTitle(root)).toBe('Summer love')
  })

  it('does not reprocess the previous song when only the title changes', () => {
    const decision = planLyricsReinit(idle, {
      title: 'Summer love',
      fullscreen: false,
      hasUnprocessed: false,
      hasAnyLine: true,
    })
    expect(decision.init).toBe(false)
    expect(decision.clearCache).toBe(true)
    expect(decision.stripStale).toBe(true)
    expect(decision.state.pendingSong).toBe(true)
    expect(decision.state.lastSongTitle).toBe('Summer love')
  })

  it('inits once the new song mounts raw lyric lines', () => {
    const waiting: LyricsWatchState = {
      lastSongTitle: 'Summer love',
      lastFullscreen: false,
      pendingSong: true,
    }
    const decision = planLyricsReinit(waiting, {
      title: 'Summer love',
      fullscreen: false,
      hasUnprocessed: true,
      hasAnyLine: true,
    })
    expect(decision.init).toBe(true)
    expect(decision.clearCache).toBe(false)
    expect(decision.state.pendingSong).toBe(false)
  })

  it('does not init again after the new lines are processed', () => {
    const done: LyricsWatchState = {
      lastSongTitle: 'Summer love',
      lastFullscreen: false,
      pendingSong: false,
    }
    const decision = planLyricsReinit(done, {
      title: 'Summer love',
      fullscreen: false,
      hasUnprocessed: false,
      hasAnyLine: true,
    })
    expect(decision.init).toBe(false)
    expect(decision.stripStale).toBe(false)
  })

  it('treats a line without slots as unprocessed', () => {
    const container = document.createElement('div')
    const raw = document.createElement('div')
    raw.setAttribute('data-testid', 'lyrics-line')
    raw.textContent = '夏色に心は踊る'
    const done = document.createElement('div')
    done.setAttribute('data-testid', 'lyrics-line')
    const original = document.createElement('p')
    original.className = 'original-lyric'
    original.textContent = 'already'
    done.appendChild(original)
    container.append(raw, done)
    expect(containerHasUnprocessedLines(container)).toBe(true)
  })
})
