import { storage } from '#imports'
import { translate } from 'google-translate-api-x'
import { Background } from '@/utils/messaging'
import {
  setTranslationCacheEntry,
  translationCacheKey,
  type TranslationCache,
} from '@/utils/translation-cache'

Background.onMessage('translate', async ({ data }) => {
  const to = data.to ?? 'auto'
  const title = data.title ?? ''
  const key = translationCacheKey(title, to)
  const cache = await storage.getItem<TranslationCache>('session:translations') || {}

  if (key in cache) return cache[key]

  try {
    const translation = await translate(data.text, {
      to,
      from: data.from ?? 'auto',
      rejectOnPartialFail: false,
    })

    setTranslationCacheEntry(cache, key, translation.text)
    await storage.setItem('session:translations', cache)

    return cache[key]
  } catch (error) {
    console.error(error)
    return ''
  }
})
