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

export default async function lyricsRomanization(data: MoegiOptions): Promise<void> {
  if (!data.romanization) return

  const romanize = await romanizations[data.romanization.language].then(e => e.default)
  const lyrics = Array.from(document.querySelectorAll(LYRIC_SELECTOR))

  for (const lyric of lyrics) {
    const original = lyric.querySelector('.'+ORIGINAL_LYRIC)
    if (!original) continue

    const text = original.textContent
    if (!text) continue

    const romanized = await romanize.convert(text, data.romanization)

    lyric.querySelector('.'+ROMANIZED_LYRIC)!.textContent = romanized
  }
}
