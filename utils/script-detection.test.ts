import { describe, expect, it } from 'vitest'
import { getProviderForScript, splitTextByScript } from './script-detection'

describe('getProviderForScript', () => {
  it('maps known scripts to providers', () => {
    expect(getProviderForScript('Hiragana')).toBe('japanese')
    expect(getProviderForScript('Katakana')).toBe('japanese')
    expect(getProviderForScript('Hangul')).toBe('korean')
    expect(getProviderForScript('Han')).toBe('chinese')
    expect(getProviderForScript('Cyrillic')).toBe('cyrillic')
    expect(getProviderForScript('Latin')).toBe('none')
    expect(getProviderForScript('Common')).toBe('none')
    expect(getProviderForScript('Arabic')).toBe('any')
  })
})

describe('splitTextByScript', () => {
  it('keeps latin text as a latin segment', () => {
    const segments = splitTextByScript('Hello world')
    expect(segments.length).toBeGreaterThan(0)
    expect(segments.every(s => s.script === 'Latin' || s.script === 'Common')).toBe(true)
    expect(segments.map(s => s.text).join('')).toBe('Hello world')
  })

  it('detects hangul segments', () => {
    const segments = splitTextByScript('안녕')
    expect(segments.some(s => s.script === 'Hangul')).toBe(true)
    expect(segments.map(s => s.text).join('')).toBe('안녕')
  })

  it('detects hiragana/katakana as japanese scripts', () => {
    const segments = splitTextByScript('こんにちはカタカナ')
    const scripts = new Set(segments.map(s => s.script))
    expect(scripts.has('Hiragana') || scripts.has('Katakana')).toBe(true)
  })

  it('merges han with kana for japanese runs', () => {
    const segments = splitTextByScript('漢字ひらがな')
    // Han should merge into the kana-adjacent run rather than stay isolated when possible
    expect(segments.map(s => s.text).join('')).toBe('漢字ひらがな')
    expect(segments.some(s => s.script === 'Hiragana' || s.script === 'Katakana')).toBe(true)
  })

  it('detects cyrillic', () => {
    const segments = splitTextByScript('Привет')
    expect(segments.some(s => s.script === 'Cyrillic')).toBe(true)
  })
})
