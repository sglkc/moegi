import ChromeStorage from '@/utils/chrome-storage';
import { googleTranslateApi, translate } from 'google-translate-api-x';

type TranslateMessage = {
  type: 'translate'
  title: string
  text: string
  options: googleTranslateApi.RequestOptions
}

type TranslationCache = {
  [key: string]: string[]
}

// Use caching to avoid translate request limit
const sessionStorage = new ChromeStorage('session')

// @ts-ignore
self.sessionStorage = sessionStorage

chrome.runtime.onMessageExternal.addListener(
  async (message: TranslateMessage, _, response) => {
    if (message.type !== 'translate') return

    const target = message.options.to ?? 'auto'
    const title = message.title + '.' + target
    const options: googleTranslateApi.RequestOptions = {
      to: target,
      rejectOnPartialFail: false
    }

    const cache =
      (await sessionStorage.get<TranslationCache>('translations')) ?? {}

    if (title in cache) return response(cache[title])

    translate(message.text, options)
      .then((result) => {
        const { text } = result as googleTranslateApi.TranslationResponse
        const textArray = text.split('\n').map(t => t.trim())

        cache[title] = textArray

        sessionStorage.set({ translations: cache })
        return response(textArray)
      })
      .catch(console.error)
  }
)
