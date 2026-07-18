import './messaging.mock'

import { beforeEach, describe, expect, it } from 'vitest'
import {
  contentSendMessage,
  resetMessagingMocks,
} from './messaging.mock'
import lyricsRomanization from './romanization'
import {
  enabledRomanization,
  getRomanized,
  mountLyricsPage,
} from './test-fixtures'
import { moegiDefaultOptions } from '@/utils/options'

describe('lyricsRomanization (feature)', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    resetMessagingMocks()
  })

  it('clears romanized slots when romanization is disabled', async () => {
    // Disabled path uses document.querySelectorAll — lines must be mounted
    const { lyrics } = mountLyricsPage({ lines: ['안녕'] })
    lyrics[0].querySelector('.romanized-lyric')!.textContent = 'stale'

    await lyricsRomanization(lyrics, {
      ...structuredClone(moegiDefaultOptions.romanization),
      enabled: false,
    })

    expect(getRomanized(lyrics[0])).toBe('')
    expect(contentSendMessage).not.toHaveBeenCalled()
  })

  it('romanizes Hangul with the Korean provider', async () => {
    const { lyrics } = mountLyricsPage({ lines: ['안녕'] })

    await lyricsRomanization(lyrics, enabledRomanization({
      korean: { system: 'RR' },
    }))

    const out = getRomanized(lyrics[0])
    expect(out.length).toBeGreaterThan(0)
    // Revised Romanization of 안녕 is typically "annyeong"
    expect(out.toLowerCase()).toMatch(/ann?yeong|an nyeong|annyeong/)
    expect(contentSendMessage).toHaveBeenCalledWith('createToast', { text: 'Romanizing...' })
    expect(contentSendMessage).toHaveBeenCalledWith('destroyToast', 1)
  })

  it('romanizes Cyrillic with the cyrillic provider', async () => {
    const { lyrics } = mountLyricsPage({ lines: ['Привет'] })

    await lyricsRomanization(lyrics, enabledRomanization({
      cyrillic: { lang: 'ru' },
    }))

    const out = getRomanized(lyrics[0])
    expect(out.length).toBeGreaterThan(0)
    expect(out.toLowerCase()).toMatch(/privet|привет/i)
    // translit should produce latin letters
    expect(out).toMatch(/[A-Za-z]/)
  })

  it('romanizes Chinese Han to pinyin when not using ruby', async () => {
    const { lyrics } = mountLyricsPage({ lines: ['你好'] })

    await lyricsRomanization(lyrics, enabledRomanization({
      chinese: { ruby: false },
    }))

    const out = getRomanized(lyrics[0])
    expect(out.length).toBeGreaterThan(0)
    // pinyin-pro default is spaced pinyin with tones or without depending on version
    expect(out.toLowerCase()).toMatch(/ni|hao|nǐ|hǎo/)
  })

  it('keeps Latin segments unchanged', async () => {
    const { lyrics } = mountLyricsPage({ lines: ['Hello world'] })

    await lyricsRomanization(lyrics, enabledRomanization())

    expect(getRomanized(lyrics[0])).toBe('Hello world')
  })

  it('handles mixed Hangul + Latin in one line', async () => {
    const { lyrics } = mountLyricsPage({ lines: ['Hello 안녕'] })

    await lyricsRomanization(lyrics, enabledRomanization())

    const out = getRomanized(lyrics[0])
    expect(out).toContain('Hello')
    expect(out.toLowerCase()).toMatch(/ann?yeong|annyeong/)
  })
})
