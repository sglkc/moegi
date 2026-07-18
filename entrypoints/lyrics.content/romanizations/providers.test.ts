import { describe, expect, it } from 'vitest'
import anyProvider from './any'
import chineseProvider from './chinese'
import cyrillicProvider from './cyrillic'
import koreanProvider from './korean'
import { moegiDefaultOptions } from '@/utils/options'

const romanization = structuredClone(moegiDefaultOptions.romanization)

describe('romanization providers (offline smoke)', () => {
  it('korean converts hangul', async () => {
    expect(koreanProvider.check('안녕')).toBe(true)
    const out = await koreanProvider.convert('안녕', romanization)
    expect(out.toLowerCase()).toMatch(/ann?yeong|annyeong/)
  })

  it('chinese converts han to pinyin', async () => {
    expect(chineseProvider.check('你好')).toBe(true)
    const out = await chineseProvider.convert('你好', romanization)
    expect(out.toLowerCase()).toMatch(/ni|hao|nǐ|hǎo/)
  })

  it('cyrillic converts to latin', async () => {
    expect(cyrillicProvider.check('Привет')).toBe(true)
    const out = await cyrillicProvider.convert('Привет', romanization)
    expect(out).toMatch(/[A-Za-z]/)
  })

  it('any-ascii converts non-latin letters', async () => {
    expect(anyProvider.check('café')).toBe(true)
    const out = await anyProvider.convert('café', romanization)
    expect(out.toLowerCase()).toContain('cafe')
  })
})
