import lyricsRomanization from './romanization'
import lyricsStyling from './styling'
import lyricsTranslation from './translation'
import { createArrayHas, type DeepKeys } from '@/utils/deep-keys'
import type { MoegiOptions } from '@/utils/options'

export interface ApplyOptionsDeps {
  styling: typeof lyricsStyling
  romanization: typeof lyricsRomanization
  translation: typeof lyricsTranslation
}

const defaultDeps: ApplyOptionsDeps = {
  styling: lyricsStyling,
  romanization: lyricsRomanization,
  translation: lyricsTranslation,
}

/**
 * High-level options fan-out used by the content script when the popup
 * (via background) pushes applyOptions.
 */
/** Same options object already applied (popup message, then the storage echo). */
export function claimOptionsApply(lastKey: string, options: MoegiOptions): string | null {
  const key = JSON.stringify(options)
  return key === lastKey ? null : key
}

export function applyOptionChanges(
  changes: DeepKeys<MoegiOptions>[],
  options: MoegiOptions,
  lyrics: Iterable<HTMLDivElement>,
  deps: ApplyOptionsDeps = defaultDeps,
): void {
  const has = createArrayHas(changes)

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
