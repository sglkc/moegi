import {
  LYRIC_SELECTOR as LYRIC,
  ORIGINAL_LYRIC as ORIGINAL,
  TRANSLATED_LYRIC as TRANSLATED,
  ROMANIZED_LYRIC as ROMANIZED,
  LYRICS_CONTAINER as CONTAINER
} from '@/utils/constants'
import { MoegiOptions } from '@/utils/options'

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
    (data.translation.enabled || data.romanization.enabled) && data.fonts.hideOriginal;

  /**
   * TODO: passed lyric variable no longer used in latest Spotify
   * @see {@link https://github.com/sglkc/moegi/issues/17#issuecomment-2645904494|GitHub}
   */
  const css = `
    ${!fontsEnabled ? '/*' : ''}
    ${LYRIC} {
      margin-top: ${data.fonts.spacing}px;
      font-size: ${data.fonts.size}em;
      text-align: ${data.fonts.align};
      line-height: 1.5;
    }

    .${ORIGINAL}:has(~ :is(.${ROMANIZED}, .${TRANSLATED}):not(:empty)) {
      display: ${hideOriginal ? 'none' : 'inherit'};
    }
    ${!fontsEnabled ? '*/' : ''}

    .${ROMANIZED} {
      font-size: ${data.romanization.size}em;
    }

    .${TRANSLATED} {
      font-size: ${data.translation.size}em;
    }

    ${!colorsEnabled ? '/*' : ''}
    .${ROMANIZED} {
      color: var(--lyrics-color-romanization);
    }

    .${TRANSLATED} {
      color: var(--lyrics-color-translation);
    }

    ${LYRIC}:has(~ .active-lyric) {
      --lyrics-color-passed: ${data.colors.passed || 'inherit'};
    }

    ${CONTAINER} > div:nth-child(1) {
      --lyrics-color-background: ${data.colors.background || 'inherit'};
    }

    ${CONTAINER} > div:nth-child(2) {
      --lyrics-color-active: ${data.colors.active || 'inherit'};
      --lyrics-color-inactive: ${data.colors.inactive || 'inherit'};
      --lyrics-color-romanization: ${data.colors.romanization || 'inherit'};
      --lyrics-color-translation: ${data.colors.translation || 'inherit'};
    }
    ${!colorsEnabled ? '*/' : ''}
  `.trim();

  style.innerHTML = css
}
