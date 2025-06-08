import { LYRIC_SELECTOR, ORIGINAL_LYRIC, ROMANIZED_LYRIC } from '@/utils/constants'
import { Content } from '@/utils/messaging'
import { RomanizationOptions } from '@/utils/options'

export interface RomanizationProvider {
  check: (text: string) => boolean
  convert: (text: string, data: RomanizationOptions) => Promise<string>
}

// Use lazy loading for performance ig
const romanizations = {
  any: import('./romanizations/any'),
  korean: import('./romanizations/korean'),
  chinese: import('./romanizations/chinese'),
  cyrillic: import('./romanizations/cyrillic'),
  japanese: import('./romanizations/japanese'),
}

export default async function lyricsRomanization(data: RomanizationOptions): Promise<void> {
  if (!data.enabled) {
    document.querySelectorAll('.'+ROMANIZED_LYRIC).forEach(el => el.textContent = '')
    return
  }

  if (!(data.language in romanizations)) return

  const lyrics = document.querySelectorAll(LYRIC_SELECTOR)
  const toastId = await Content.sendMessage('createToast', { text: 'Romanizing...' })
  const romanize = await romanizations[data.language].then(e => e.default)

  for (const lyric of lyrics) {
    const original = lyric.querySelector('.'+ORIGINAL_LYRIC)
    if (!original) continue

    const text = original.textContent
    if (!text) continue

    // Korean romanization returns error for invalid characters
    try {
      const romanized = await romanize.convert(text, data)

      // Japanese furigana uses ruby elements
      lyric.querySelector('.'+ROMANIZED_LYRIC)!.innerHTML = romanized
    } catch (error) {
      console.error('Romanization error:', error)
      lyric.querySelector('.'+ROMANIZED_LYRIC)!.textContent = ''
    }
  }

  await Content.sendMessage('destroyToast', toastId)
}
