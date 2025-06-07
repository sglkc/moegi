import { storage } from '#imports'
import { translate } from 'google-translate-api-x'
import { Background } from '@/utils/messaging'

type TranslationCache = Record<string, string>

Background.onMessage('translate', async ({ data }) => {
  const to = data.to ?? 'auto'
  const title = data.title + '.' + to
  const cache = await storage.getItem<TranslationCache>('session:translations') || {}

  if (title in cache) return cache[title]

  try {
    const translation = await translate(data.text, {
      to,
      from: data.from ?? 'auto',
      rejectOnPartialFail: false,
    })

    cache[title] = translation.text
    storage.setItem('session:translations', cache)

    return cache[title]
  } catch (error) {
    console.error(error)
    return ''
  }
})
