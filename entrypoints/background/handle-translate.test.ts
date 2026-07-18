import { beforeEach, describe, expect, it, vi } from 'vitest'
import { handleTranslate, TranslateStorage } from './handle-translate'
import { translationCacheKey } from '@/utils/translation-cache'

describe('handleTranslate (background translate flow)', () => {
  let store: Record<string, unknown>
  let storage: TranslateStorage
  const translateFn = vi.fn()

  beforeEach(() => {
    store = {}
    storage = {
      getItem: vi.fn(async (key: string) => (store[key] as never) ?? null),
      setItem: vi.fn(async (key: string, value: unknown) => {
        store[key] = value
      }),
    }
    translateFn.mockReset()
  })

  it('calls Google Translate and caches the result', async () => {
    translateFn.mockResolvedValue({ text: 'hola\nmundo' })

    const result = await handleTranslate(
      { text: 'hello\nworld', title: 'Song A', to: 'es' },
      { storage, translateFn },
    )

    expect(result).toBe('hola\nmundo')
    expect(translateFn).toHaveBeenCalledOnce()
    expect(storage.setItem).toHaveBeenCalledWith(
      'session:translations',
      expect.objectContaining({
        [translationCacheKey('Song A', 'es')]: 'hola\nmundo',
      }),
    )
  })

  it('returns cached text without calling translate again', async () => {
    const key = translationCacheKey('Song A', 'es')
    store['session:translations'] = { [key]: 'cached' }

    const result = await handleTranslate(
      { text: 'hello', title: 'Song A', to: 'es' },
      { storage, translateFn },
    )

    expect(result).toBe('cached')
    expect(translateFn).not.toHaveBeenCalled()
  })

  it('returns empty string when translate throws', async () => {
    translateFn.mockRejectedValue(new Error('rate limited'))

    const result = await handleTranslate(
      { text: 'hello', title: 'Song B', to: 'en' },
      { storage, translateFn },
    )

    expect(result).toBe('')
  })

  it('scopes cache by title and target language', async () => {
    translateFn
      .mockResolvedValueOnce({ text: 'en-text' })
      .mockResolvedValueOnce({ text: 'ja-text' })

    await handleTranslate(
      { text: 'hello', title: 'Same', to: 'en' },
      { storage, translateFn },
    )
    await handleTranslate(
      { text: 'hello', title: 'Same', to: 'ja' },
      { storage, translateFn },
    )

    expect(translateFn).toHaveBeenCalledTimes(2)
    const cache = store['session:translations'] as Record<string, string>
    expect(cache[translationCacheKey('Same', 'en')]).toBe('en-text')
    expect(cache[translationCacheKey('Same', 'ja')]).toBe('ja-text')
  })
})
