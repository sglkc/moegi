import { storage } from '#imports'
import { Background } from '@/utils/messaging'
import type { TranslationCache } from '@/utils/translation-cache'
import { handleTranslate } from './handle-translate'

Background.onMessage('translate', async ({ data }) => {
  return handleTranslate(data, {
    storage: {
      getItem: (key) => storage.getItem<TranslationCache>(key),
      setItem: (key, value) => storage.setItem(key, value),
    },
  })
})
