import { ORIGINAL_LYRIC, ROMANIZED_LYRIC } from '@/utils/constants'
import { Content } from '@/utils/messaging'
import { RomanizationOptions } from '@/utils/options'
import { splitTextByScript, getProviderForScript } from '@/utils/script-detection'

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

export default async function lyricsRomanization(
  lyrics: Iterable<HTMLDivElement>,
  data: RomanizationOptions
): Promise<void> {
  if (!data.enabled) {
    document.querySelectorAll('.'+ROMANIZED_LYRIC).forEach(el => el.textContent = '')
    return
  }

  const toastId = await Content.sendMessage('createToast', { text: 'Romanizing...' })

  for (const lyric of lyrics) {
    const original = lyric.querySelector('.'+ORIGINAL_LYRIC)
    if (!original) continue

    const text = original.textContent
    if (!text) continue

    try {
      // Split text by Unicode scripts
      const scriptSegments = splitTextByScript(text)
      let romanizedResult = ''

      for (const segment of scriptSegments) {
        const providerName = getProviderForScript(segment.script)

        if (providerName === 'none') {
          // Don't romanize Latin or common characters, keep original
          romanizedResult += segment.text
          continue
        }

        if (!(providerName in romanizations)) {
          // Fallback to original text if provider not found
          romanizedResult += segment.text
          continue
        }

        const romanize = await romanizations[providerName].then(e => e.default)

        // Only romanize if the provider's check passes
        if (romanize.check(segment.text)) {
          const romanized = await romanize.convert(segment.text, data)
          romanizedResult += romanized
        } else {
          // Keep original text if check fails
          romanizedResult += segment.text
        }
      }

      // Japanese furigana uses ruby elements, others use text
      lyric.querySelector('.'+ROMANIZED_LYRIC)!.innerHTML = romanizedResult
    } catch (error) {
      console.error('Romanization error:', error)
      lyric.querySelector('.'+ROMANIZED_LYRIC)!.textContent = ''
    }
  }

  await Content.sendMessage('destroyToast', toastId)
}
