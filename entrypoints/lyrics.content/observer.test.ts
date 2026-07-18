import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  cacheLyricElement,
  clearLyricsCache,
} from './cache'
import lyricsObserver from './observer'
import { processLyricElement } from './process-lyric'
import { createRawLyricLine } from './test-fixtures'
import { ROMANIZED_LYRIC } from '@/utils/constants'

describe('lyricsObserver (restore-on-readd flow)', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    clearLyricsCache()
  })

  afterEach(() => {
    clearLyricsCache()
  })

  it('restores cached HTML when a lyrics-line node is re-added', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const line = createRawLyricLine('restore me')
    processLyricElement(line)
    line.querySelector(`.${ROMANIZED_LYRIC}`)!.textContent = 'restored-romaji'
    cacheLyricElement(line)

    lyricsObserver(container)

    // Spotify thrash: re-add raw line with same original text
    const readded = createRawLyricLine('restore me')
    container.appendChild(readded)

    // MutationObserver delivery is async in some engines
    await new Promise((r) => setTimeout(r, 0))
    await new Promise((r) => setTimeout(r, 10))

    expect(readded.querySelector(`.${ROMANIZED_LYRIC}`)?.textContent).toBe('restored-romaji')
  })
})
