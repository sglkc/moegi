import { translate } from 'google-translate-api-x'
import { TranslateMessage } from '@/utils/messaging'
import {
  setTranslationCacheEntry,
  translationCacheKey,
  type TranslationCache,
} from '@/utils/translation-cache'

export type SessionStorageKey = `session:${string}`

export interface TranslateStorage {
  getItem: (key: SessionStorageKey) => Promise<TranslationCache | null>
  setItem: (key: SessionStorageKey, value: TranslationCache) => Promise<void>
}

export type TranslateFn = typeof translate

const SESSION_KEY: SessionStorageKey = 'session:translations'

/**
 * Background translate handler: session cache + Google Translate.
 * Extracted so tests can inject storage and the translate function.
 */
export async function handleTranslate(
  data: TranslateMessage,
  deps: {
    storage: TranslateStorage
    translateFn?: TranslateFn
  },
): Promise<string> {
  const translateFn = deps.translateFn ?? translate
  const to = data.to ?? 'auto'
  const title = data.title ?? ''
  const key = translationCacheKey(title, to)
  const cache = (await deps.storage.getItem(SESSION_KEY)) || {}

  if (key in cache) return cache[key]

  try {
    const translation = await translateFn(data.text, {
      to,
      from: data.from ?? 'auto',
      rejectOnPartialFail: false,
    })

    setTranslationCacheEntry(cache, key, translation.text)
    await deps.storage.setItem(SESSION_KEY, cache)

    return cache[key]
  } catch (error) {
    console.error(error)
    return ''
  }
}
