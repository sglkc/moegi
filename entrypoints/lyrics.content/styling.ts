import {
  LYRIC_SELECTOR as LYRIC,
  ORIGINAL_LYRIC as ORIGINAL,
  TRANSLATED_LYRIC as TRANSLATED,
  ROMANIZED_LYRIC as ROMANIZED,
  LYRICS_CONTAINER as CONTAINER
} from '@/utils/constants'
import { safeCssColor, safeCssNumber, safeTextAlign } from '@/utils/css-safe'
import type { MoegiOptions } from '@/utils/options'

export default function lyricsStyling(data: MoegiOptions): void {
  let style = document.querySelector<HTMLStyleElement>('#moegi-style')

  if (!style) {
    style = document.createElement('style')
    style.id = 'moegi-style'
    document.head.appendChild(style)
  }

  const fontsEnabled = data.fonts.enabled
  const colorsEnabled = data.colors.enabled

  const hideOriginal =
    (data.translation.enabled || data.romanization.enabled) && data.fonts.hideOriginal

  const fontSize = safeCssNumber(data.fonts.size, 1)
  const fontSpacing = safeCssNumber(data.fonts.spacing, 0)
  const textAlign = safeTextAlign(data.fonts.align)
  const romanizationSize = safeCssNumber(data.romanization.size, 1)
  const translationSize = safeCssNumber(data.translation.size, 1)

  const colorPassed = safeCssColor(data.colors.passed)
  const colorBackground = safeCssColor(data.colors.background)
  const colorActive = safeCssColor(data.colors.active)
  const colorInactive = safeCssColor(data.colors.inactive)
  const colorRomanization = safeCssColor(data.colors.romanization)
  const colorTranslation = safeCssColor(data.colors.translation)

  /**
   * TODO: passed lyric variable no longer used in latest Spotify
   * @see {@link https://github.com/sglkc/moegi/issues/17#issuecomment-2645904494|GitHub}
   */
  const css = `
    ${!fontsEnabled ? '/*' : ''}
    ${LYRIC} {
      margin-top: ${fontSpacing}px;
      font-size: ${fontSize}em;
      text-align: ${textAlign};
      line-height: 1.5;
    }

    .${ORIGINAL}:has(~ :is(.${ROMANIZED}, .${TRANSLATED}):not(:empty)) {
      display: ${hideOriginal ? 'none' : 'inherit'};
    }
    ${!fontsEnabled ? '*/' : ''}

    .${ROMANIZED} {
      font-size: ${romanizationSize}em;
    }

    .${TRANSLATED} {
      font-size: ${translationSize}em;
    }

    ${!colorsEnabled ? '/*' : ''}
    .${ROMANIZED} {
      color: var(--lyrics-color-romanization);
    }

    .${TRANSLATED} {
      color: var(--lyrics-color-translation);
    }

    ${LYRIC}:has(~ .active-lyric) {
      --lyrics-color-passed: ${colorPassed};
    }

    ${CONTAINER} > div:nth-child(1) {
      --lyrics-color-background: ${colorBackground};
    }

    ${CONTAINER} > div:nth-child(2) {
      --lyrics-color-active: ${colorActive};
      --lyrics-color-inactive: ${colorInactive};
      --lyrics-color-romanization: ${colorRomanization};
      --lyrics-color-translation: ${colorTranslation};
    }
    ${!colorsEnabled ? '*/' : ''}
  `.trim()

  style.textContent = css
}
