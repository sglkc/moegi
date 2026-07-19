import { beforeEach, describe, expect, it } from 'vitest'
import {
  findLyricsContainer,
  mutationIndicatesSongChange,
  shouldReinitLyrics,
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
