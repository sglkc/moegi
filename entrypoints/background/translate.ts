import { storage } from '#imports'
import { translate } from 'google-translate-api-x'
import { Background } from '@/utils/messaging'
import { SourceLanguage, TargetLanguage, translate as deepl } from '@deeplx/core'

type TranslationCache = Record<string, string>

Background.onMessage('translate', async ({ data }) => {
  const to = data.to ?? 'en'
  const provider = data.provider ?? 'google'
  const from = provider === 'deepl' ? (data.from ?? 'en'): 'auto'
  const key = `${data.title}.${to}.${provider}`
  const cache = await storage.getItem<TranslationCache>('session:translations') || {}

  // Skip cache if title somehow is empty
  if (data.title && key in cache) return cache[key]

  // TODO: catch unsupported language code?
  try {
    let translated: string

    if (provider === 'deepl') {
      const translation = await deepl(
        data.text,
        to as TargetLanguage,
        from as SourceLanguage,
        false,
      )

      translated = translation
    } else {
      const translation = await translate(data.text, {
        to,
        from,
        rejectOnPartialFail: false,
      })

      translated = translation.text
    }

    // Sometimes there's newlines i think
    cache[key] = translated.trim()
    storage.setItem('session:translations', cache)

    return cache[key]
  } catch (error) {
    console.error(error)
    return ''
  }
})
