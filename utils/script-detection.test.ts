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

  it('routes isolated Han (kanji-only) to chinese, not japanese', () => {
    // Ambiguity: CJK kanji without kana is treated as Chinese pinyin path
    expect(getProviderForScript('Han')).toBe('chinese')
    const segments = splitTextByScript('漢字')
    expect(segments).toHaveLength(1)
    expect(segments[0].script).toBe('Han')
    expect(getProviderForScript(segments[0].script)).toBe('chinese')
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

  it('merges han with kana for japanese runs (not chinese)', () => {
    const segments = splitTextByScript('漢字ひらがな')
    // Han should merge into the kana-adjacent run rather than stay isolated when possible
    expect(segments.map(s => s.text).join('')).toBe('漢字ひらがな')
    expect(segments.some(s => s.script === 'Hiragana' || s.script === 'Katakana')).toBe(true)
    // Merged run keeps kana script so getProviderForScript → japanese
    for (const seg of segments) {
      if (seg.text.includes('漢字')) {
        expect(['Hiragana', 'Katakana']).toContain(seg.script)
        expect(getProviderForScript(seg.script)).toBe('japanese')
      }
    }
  })

  it('does not merge isolated Han with Latin (stays chinese path)', () => {
    const segments = splitTextByScript('漢字ABC')
    const han = segments.find(s => s.script === 'Han')
    const latin = segments.find(s => s.script === 'Latin')
    expect(han).toBeTruthy()
    expect(latin).toBeTruthy()
    expect(getProviderForScript(han!.script)).toBe('chinese')
    expect(getProviderForScript(latin!.script)).toBe('none')
  })

  it('merges Han with katakana the same as hiragana (japanese)', () => {
    const segments = splitTextByScript('東京スカイツリー')
    expect(segments.map(s => s.text).join('')).toBe('東京スカイツリー')
    // Should not leave a bare Han segment that would go to chinese
    const bareHan = segments.filter(s => s.script === 'Han')
    expect(bareHan).toHaveLength(0)
    expect(segments.every(s => getProviderForScript(s.script) === 'japanese' || getProviderForScript(s.script) === 'none')).toBe(true)
  })

  it('detects cyrillic', () => {
    const segments = splitTextByScript('Привет')
    expect(segments.some(s => s.script === 'Cyrillic')).toBe(true)
  })
})
