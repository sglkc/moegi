import { processLyricElement } from './process-lyric'
import {
  ORIGINAL_LYRIC,
  ROMANIZED_LYRIC,
  TRANSLATED_LYRIC,
} from '@/utils/constants'
import { moegiDefaultOptions, type MoegiOptions, type RomanizationOptions, type TranslationOptions } from '@/utils/options'

/** Build a raw Spotify-shaped lyric line (single text child). */
export function createRawLyricLine(text: string): HTMLDivElement {
  const line = document.createElement('div')
  line.setAttribute('data-testid', 'lyrics-line')
  const span = document.createElement('span')
  span.textContent = text
  line.appendChild(span)
  return line
}

/** Process raw lines into original / romanized / translated slots. */
export function createProcessedLyrics(texts: string[]): HTMLDivElement[] {
  return texts.map((text) => {
    const line = createRawLyricLine(text)
    processLyricElement(line)
    return line
  })
}

/** Mount lyrics + optional song title into document.body. */
export function mountLyricsPage(options: {
  lines: string[]
  title?: string
  process?: boolean
}): {
  container: HTMLDivElement
  lyrics: HTMLDivElement[]
} {
  document.body.innerHTML = ''

  if (options.title !== undefined) {
    const title = document.createElement('div')
    title.setAttribute('data-testid', 'now-playing-widget')
    title.textContent = options.title
    document.body.appendChild(title)
  }

  const container = document.createElement('div')
  container.setAttribute('style', '--lyrics-color-active: #fff')
  document.body.appendChild(container)

  const lyrics = options.lines.map((text) => {
    const line = createRawLyricLine(text)
    if (options.process !== false) {
      processLyricElement(line)
    }
    container.appendChild(line)
    return line
  })

  return { container, lyrics }
}

export function getOriginal(line: HTMLElement): string {
  return line.querySelector(`.${ORIGINAL_LYRIC}`)?.textContent ?? ''
}

export function getRomanized(line: HTMLElement): string {
  return line.querySelector(`.${ROMANIZED_LYRIC}`)?.textContent ?? ''
}

export function getRomanizedHtml(line: HTMLElement): string {
  return line.querySelector(`.${ROMANIZED_LYRIC}`)?.innerHTML ?? ''
}

export function getTranslated(line: HTMLElement): string {
  return line.querySelector(`.${TRANSLATED_LYRIC}`)?.textContent ?? ''
}

export function enabledRomanization(
  overrides: Partial<RomanizationOptions> = {},
): RomanizationOptions {
  return {
    ...structuredClone(moegiDefaultOptions.romanization),
    enabled: true,
    ...overrides,
  }
}

export function enabledTranslation(
  overrides: Partial<TranslationOptions> = {},
): TranslationOptions {
  return {
    ...structuredClone(moegiDefaultOptions.translation),
    enabled: true,
    ...overrides,
  }
}

export function optionsWith(partial: {
  fonts?: Partial<MoegiOptions['fonts']>
  colors?: Partial<MoegiOptions['colors']>
  translation?: Partial<MoegiOptions['translation']>
  romanization?: Partial<MoegiOptions['romanization']>
}): MoegiOptions {
  const base = structuredClone(moegiDefaultOptions)
  return {
    fonts: { ...base.fonts, ...partial.fonts },
    colors: { ...base.colors, ...partial.colors },
    translation: { ...base.translation, ...partial.translation },
    romanization: { ...base.romanization, ...partial.romanization },
  }
}
