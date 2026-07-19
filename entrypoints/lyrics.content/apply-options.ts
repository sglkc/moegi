import { configureAutoScroll } from './auto-scroll'
import lyricsRomanization from './romanization'
import lyricsStyling from './styling'
import lyricsTranslation from './translation'
import { createArrayHas, DeepKeys } from '@/utils/deep-keys'
import { MoegiOptions } from '@/utils/options'

export interface ApplyOptionsDeps {
  styling: typeof lyricsStyling
  romanization: typeof lyricsRomanization
  translation: typeof lyricsTranslation
  autoScroll: typeof configureAutoScroll
}

const defaultDeps: ApplyOptionsDeps = {
  styling: lyricsStyling,
  romanization: lyricsRomanization,
  translation: lyricsTranslation,
  autoScroll: configureAutoScroll,
}

/**
 * High-level options fan-out used by the content script when the popup
 * (via background) pushes applyOptions.
 */
export function applyOptionChanges(
  changes: DeepKeys<MoegiOptions>[],
  options: MoegiOptions,
  lyrics: Iterable<HTMLDivElement>,
  deps: ApplyOptionsDeps = defaultDeps,
): void {
  const has = createArrayHas(changes)
  const lyricList = [...lyrics]

  if (has(
    'fonts',
    'colors',
    'translation.enabled',
    'translation.size',
    'romanization.enabled',
    'romanization.size',
  )) {
    deps.styling(options)
  }

  if (has('fonts', 'fonts.autoScroll')) {
    const first = lyricList[0]
    const container = first?.parentElement
    if (container) deps.autoScroll(container, options.fonts.autoScroll)
  }

  if (has(
    'romanization.enabled',
    'romanization.chinese',
    'romanization.cyrillic',
    'romanization.japanese',
    'romanization.korean',
  )) {
    void deps.romanization(lyrics, options.romanization)
  }

  if (has(
    'translation.enabled',
    'translation.target',
  )) {
    void deps.translation(lyrics, options.translation)
  }
}
