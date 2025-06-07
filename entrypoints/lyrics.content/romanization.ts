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
  if (!(data.language in romanizations)) return

  const lyrics = Array.from(document.querySelectorAll(LYRIC_SELECTOR))
  if (!lyrics.length) return

  const toastId = await Content.sendMessage('createToast', { text: 'Romanizing...' })
  const romanize = await romanizations[data.language].then(e => e.default)

  for (const lyric of lyrics) {
    const original = lyric.querySelector('.'+ORIGINAL_LYRIC)
    if (!original) continue

    const text = original.textContent
    if (!text) continue

    const romanized = await romanize.convert(text, data)

    lyric.querySelector('.'+ROMANIZED_LYRIC)!.textContent = romanized
  }

  await Content.sendMessage('destroyToast', toastId)
}
