import { beforeEach, describe, expect, it } from 'vitest'
import { processLyricElement } from './process-lyric'
import {
  createRawLyricLine,
  getOriginal,
  getRomanized,
  getTranslated,
} from './test-fixtures'
import {
  ORIGINAL_LYRIC,
  ROMANIZED_LYRIC,
  TRANSLATED_LYRIC,
} from '@/utils/constants'

describe('processLyricElement (lyric line normalization)', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('splits a raw lyric line into original, romanized, and translated slots', () => {
    const line = createRawLyricLine('  안녕하세요  ')
    processLyricElement(line)

    expect(line.children).toHaveLength(3)
    expect(line.children[0]?.className).toBe(ORIGINAL_LYRIC)
    expect(line.children[1]?.className).toBe(ROMANIZED_LYRIC)
    expect(line.children[2]?.className).toBe(TRANSLATED_LYRIC)

    expect(getOriginal(line)).toBe('안녕하세요')
    expect(getRomanized(line)).toBe('')
    expect(getTranslated(line)).toBe('')
  })

  it('ignores empty lines', () => {
    const line = createRawLyricLine('   ')
    processLyricElement(line)

    // Only the original empty span remains (no slot rewrite)
    expect(line.querySelector(`.${ORIGINAL_LYRIC}`)).toBeNull()
    expect(line.children).toHaveLength(1)
  })

  it('re-processes an already initialized line from the original slot', () => {
    const line = createRawLyricLine('hello')
    processLyricElement(line)
    line.querySelector(`.${ROMANIZED_LYRIC}`)!.textContent = 'should-be-cleared'
    line.querySelector(`.${TRANSLATED_LYRIC}`)!.textContent = 'also-cleared'

    processLyricElement(line)

    expect(getOriginal(line)).toBe('hello')
    expect(getRomanized(line)).toBe('')
    expect(getTranslated(line)).toBe('')
    expect(line.children).toHaveLength(3)
  })
})
