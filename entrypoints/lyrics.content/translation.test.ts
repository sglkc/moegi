import './messaging.mock'

import { beforeEach, describe, expect, it } from 'vitest'
import {
  backgroundSendMessage,
  contentSendMessage,
  resetMessagingMocks,
} from './messaging.mock'
import {
  enabledTranslation,
  getTranslated,
  mountLyricsPage,
} from './test-fixtures'
import lyricsTranslation from './translation'
import { moegiDefaultOptions } from '@/utils/options'

describe('lyricsTranslation (feature)', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    resetMessagingMocks()
  })

  it('clears translated slots when translation is disabled', async () => {
    const { lyrics } = mountLyricsPage({ lines: ['one', 'two'], title: 'Song' })
    lyrics[0]!.querySelector('.translated-lyric')!.textContent = 'stale'
    lyrics[1]!.querySelector('.translated-lyric')!.textContent = 'stale'

    await lyricsTranslation(lyrics, {
      ...structuredClone(moegiDefaultOptions.translation),
      enabled: false,
    })

    expect(getTranslated(lyrics[0]!)).toBe('')
    expect(getTranslated(lyrics[1]!)).toBe('')
    expect(backgroundSendMessage).not.toHaveBeenCalled()
  })

  it('assigns translation lines when the line count matches', async () => {
    const { lyrics } = mountLyricsPage({
      lines: ['line one', 'line two'],
      title: 'Test Track',
    })

    backgroundSendMessage.mockImplementation(async (type: string) => {
      if (type === 'translate') return 'translated one\ntranslated two'
      return undefined
    })

    await lyricsTranslation(lyrics, enabledTranslation({ target: 'en' }))

    expect(backgroundSendMessage).toHaveBeenCalledWith('translate', {
      text: 'line one\nline two',
      title: 'Test Track',
      to: 'en',
    })
    expect(getTranslated(lyrics[0]!)).toBe('translated one')
    expect(getTranslated(lyrics[1]!)).toBe('translated two')
    expect(contentSendMessage).toHaveBeenCalledWith('destroyToast', 1)
  })

  it('skips applying when Google returns a different number of lines', async () => {
    const { lyrics } = mountLyricsPage({
      lines: ['a', 'b', 'c'],
      title: 'Mismatch Song',
    })

    backgroundSendMessage.mockImplementation(async (type: string) => {
      if (type === 'translate') return 'only one line'
      return undefined
    })

    await lyricsTranslation(lyrics, enabledTranslation())

    expect(getTranslated(lyrics[0]!)).toBe('')
    expect(getTranslated(lyrics[1]!)).toBe('')
    expect(getTranslated(lyrics[2]!)).toBe('')
    expect(contentSendMessage).toHaveBeenCalledWith(
      'createToast',
      expect.objectContaining({
        text: expect.stringMatching(/line count mismatch/i),
      }),
    )
  })

  it('shows a failure toast when translate returns empty', async () => {
    const { lyrics } = mountLyricsPage({
      lines: ['hello'],
      title: 'Empty Result',
    })

    backgroundSendMessage.mockResolvedValue('')

    await lyricsTranslation(lyrics, enabledTranslation())

    expect(getTranslated(lyrics[0]!)).toBe('')
    expect(contentSendMessage).toHaveBeenCalledWith(
      'createToast',
      expect.objectContaining({ text: 'Translation failed' }),
    )
  })

  it('does nothing without a song title', async () => {
    const { lyrics } = mountLyricsPage({
      lines: ['orphan'],
      // no title
    })

    await lyricsTranslation(lyrics, enabledTranslation())

    expect(backgroundSendMessage).not.toHaveBeenCalled()
    expect(getTranslated(lyrics[0]!)).toBe('')
  })
})
