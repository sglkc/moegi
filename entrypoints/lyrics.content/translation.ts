import { cacheLyricElement } from './cache'
import { SONG_TITLE, TRANSLATED_LYRIC } from '@/utils/constants'
import { Background, Content } from '@/utils/messaging'
import { TranslationOptions } from '@/utils/options'
import { splitTranslationLines } from '@/utils/translation-cache'

export default async function lyricsTranslation(
  lyrics: Iterable<HTMLDivElement>,
  data: TranslationOptions
): Promise<void> {
  if (!data.enabled) {
    document.querySelectorAll('.' + TRANSLATED_LYRIC).forEach(el => el.textContent = '')
    return
  }

  const title = document.querySelector(SONG_TITLE)?.textContent
  const lyricElements = Array.from(lyrics)

  // Concat every line to save translation rate limit
  const text = lyricElements
    .map(el => el.firstElementChild?.textContent ?? '')
    .join('\n')

  if (!title || !text) return

  const toastId = await Content.sendMessage('createToast', { text: 'Translating...' })
  const translated = await Background.sendMessage('translate', {
    text,
    title,
    to: data.target,
  })

  if (!translated.length) {
    await Content.sendMessage('createToast', { text: 'Translation failed', duration: 2000 })
    await Content.sendMessage('destroyToast', toastId)
    return
  }

  const lines = splitTranslationLines(translated, lyricElements.length)
  if (!lines) {
    await Content.sendMessage('createToast', {
      text: 'Translation line count mismatch — skipped',
      duration: 2500,
    })
    await Content.sendMessage('destroyToast', toastId)
    return
  }

  lyricElements.forEach((lyric, i) => {
    const el = lyric.querySelector('.' + TRANSLATED_LYRIC)
    if (!el) return

    el.textContent = lines[i]
    cacheLyricElement(lyric)
  })

  await Content.sendMessage('destroyToast', toastId)
}
