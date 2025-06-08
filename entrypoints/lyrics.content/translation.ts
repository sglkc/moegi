import { LYRIC_SELECTOR, SONG_TITLE, TRANSLATED_LYRIC } from '@/utils/constants'
import { Background, Content } from '@/utils/messaging'
import { TranslationOptions } from '@/utils/options'

export default async function lyricsTranslation(data: TranslationOptions): Promise<void> {
  if (!data.enabled) {
    document.querySelectorAll('.'+TRANSLATED_LYRIC).forEach(el => el.textContent = '')
    return
  }

  const lyrics = document.querySelectorAll(LYRIC_SELECTOR)
  const title = document.querySelector(SONG_TITLE)?.textContent

  // Concat every line to save translation rate limit
  const text = Array.from(lyrics)
    .map(el => el.firstElementChild!.textContent)
    .join('\n')

  if (!title || !text) return

  const toastId = await Content.sendMessage('createToast', { text: 'Translating...' })
  const translated = await Background.sendMessage('translate', {
    text,
    title,
    to: data.target,
  })

  if (!translated.length) {
    Content.sendMessage('createToast', { text: 'Translation failed' })
    return
  }

  // There should be a better way or something IDK
  const lines = translated.split('\n')
  let i = 0
  for (const lyric of lyrics) {
    const el = lyric.querySelector('.'+TRANSLATED_LYRIC)

    if (!el) continue

    el.textContent = lines[i]
    i++
  }

  await Content.sendMessage('destroyToast', toastId)
}
