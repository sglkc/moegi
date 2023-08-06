import { translate } from 'google-translate-api-x';

// Use caching to avoid translate request limit
let translationCache = new Map()

chrome.runtime.onMessageExternal.addListener((message, _, response) => {
  if (message.type !== 'translate') return

  const title = message.title

  if (translationCache.has(title)) {
    console.log('get from cache:', title)
    return response(translationCache.get(title))
  }

  console.log('translating:', title)

  translate(message.text, { rejectOnPartialFail: false })
    .then((result) => {
      translationCache.set(title, result)
      return response(result)
    })
    .catch(console.error)
})
