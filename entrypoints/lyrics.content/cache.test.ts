import { beforeEach, describe, expect, it } from 'vitest'
import {
  cacheLyricElement,
  clearLyricsCache,
  lyricsCache,
  restoreLyricFromCache,
} from './cache'
import { processLyricElement } from './process-lyric'
import { createRawLyricLine, getOriginal, getRomanized, getTranslated } from './test-fixtures'
import { ORIGINAL_LYRIC, ROMANIZED_LYRIC, TRANSLATED_LYRIC } from '@/utils/constants'

describe('lyrics cache (feature restore path)', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    clearLyricsCache()
  })

  it('caches processed HTML and restores it onto a raw re-added line', () => {
    const line = createRawLyricLine('cache me')
    processLyricElement(line)
    line.querySelector(`.${ROMANIZED_LYRIC}`)!.textContent = 'kae-shi'
    line.querySelector(`.${TRANSLATED_LYRIC}`)!.textContent = 'キャッシュして'

    cacheLyricElement(line)
    expect(lyricsCache.has('cache me')).toBe(true)

    // Spotify-style: element comes back with only plain text
    const readded = createRawLyricLine('cache me')
    expect(restoreLyricFromCache(readded)).toBe(true)

    expect(getOriginal(readded)).toBe('cache me')
    expect(getRomanized(readded)).toBe('kae-shi')
    expect(getTranslated(readded)).toBe('キャッシュして')
    expect(readded.querySelector(`.${ORIGINAL_LYRIC}`)).toBeTruthy()
  })

  it('returns false when nothing is cached for the text', () => {
    const line = createRawLyricLine('unknown')
    expect(restoreLyricFromCache(line)).toBe(false)
  })

  it('clearLyricsCache drops all entries', () => {
    const line = createRawLyricLine('temp')
    processLyricElement(line)
    cacheLyricElement(line)
    expect(lyricsCache.size).toBe(1)

    clearLyricsCache()
    expect(lyricsCache.size).toBe(0)
  })
})
