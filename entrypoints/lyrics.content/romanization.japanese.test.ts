import './messaging.mock'

import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { resetMessagingMocks } from './messaging.mock'
import lyricsRomanization from './romanization'
import { resolveJapaneseDictPath } from './romanizations/japanese'
import {
  enabledRomanization,
  getRomanized,
  mountLyricsPage,
} from './test-fixtures'

const require = createRequire(import.meta.url)

function packageDictPath(): string {
  return path.join(path.dirname(require.resolve('@sglkc/kuromoji/package.json')), 'dict')
}

describe('Japanese romanization (Kuroshiro major feature)', () => {
  beforeAll(() => {
    const dictPath = packageDictPath()
    expect(fs.existsSync(dictPath), `kuromoji dict missing at ${dictPath}`).toBe(true)
  })

  beforeEach(() => {
    document.body.innerHTML = ''
    resetMessagingMocks()
  })

  it('uses Node auto dict resolution under Vitest (not chrome-extension URL)', () => {
    // undefined means KuromojiAnalyzer falls back to package dict in Node
    expect(resolveJapaneseDictPath()).toBeUndefined()
  })

  it('romanizes hiragana lyrics to romaji via Kuroshiro', async () => {
    const { lyrics } = mountLyricsPage({ lines: ['こんにちは'] })

    await lyricsRomanization(lyrics, enabledRomanization({
      japanese: {
        to: 'romaji',
        mode: 'spaced',
        system: 'hepburn',
        okuStart: '(',
        okuEnd: ')',
      },
    }))

    const out = getRomanized(lyrics[0])
    expect(out.length).toBeGreaterThan(0)
    // Hepburn-ish reading of こんにちは
    expect(out.toLowerCase().replace(/\s+/g, '')).toMatch(/konnichiwa|konnichiha/)
  }, 30_000)

  it('romanizes mixed kanji+kana (Japanese script merge path)', async () => {
    const { lyrics } = mountLyricsPage({ lines: ['感じ取れたら'] })

    await lyricsRomanization(lyrics, enabledRomanization({
      japanese: {
        to: 'romaji',
        mode: 'normal',
        system: 'hepburn',
        okuStart: '(',
        okuEnd: ')',
      },
    }))

    const out = getRomanized(lyrics[0])
    expect(out.length).toBeGreaterThan(0)
    // Should be latin romaji, not raw kanji-only passthrough
    expect(out).toMatch(/[A-Za-z]/)
    expect(out).not.toMatch(/感/)
  }, 30_000)
})
