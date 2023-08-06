import ChromeStorage from '@/utils/chrome-storage';
import { googleTranslateApi, translate } from 'google-translate-api-x';

type TranslationCache = {
  [key: string]: string[]
}

// Use caching to avoid translate request limit
const sessionStorage = new ChromeStorage('session')

// @ts-ignore
self.sessionStorage = sessionStorage

chrome.runtime.onMessageExternal.addListener(async (message, _, response) => {
  if (message.type !== 'translate') return

  const title = message.title
  const cache =
    (await sessionStorage.get<TranslationCache>('translations')) ?? {}

  if (title in cache) return response(cache[title])

  translate(message.text, { rejectOnPartialFail: false })
    .then((result) => {
      const { text } = result as googleTranslateApi.TranslationResponse
      const textArray = text.split('\n').map(t => t.trim())

      cache[title] = textArray

      sessionStorage.set({ translations: cache })
      return response(textArray)
    })
    .catch(console.error)
})
