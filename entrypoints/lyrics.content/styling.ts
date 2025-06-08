import {
  LYRIC_SELECTOR as LYRIC,
  ORIGINAL_LYRIC as ORIGINAL,
  TRANSLATED_LYRIC as TRANSLATED,
  ROMANIZED_LYRIC as ROMANIZED,
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

    .${ROMANIZED} {
      font-size: ${data.romanization.size}em;
    }

    .${TRANSLATED} {
      font-size: ${data.translation.size}em;
    }
    ${!fontsEnabled ? '*/' : ''}

    ${!colorsEnabled ? '/*' : ''}
    .${ROMANIZED} {
      color: var(--lyrics-color-romanization);
    }

    .${TRANSLATED} {
      color: var(--lyrics-color-translation);
    }

    ${LYRIC}:has(~ .active-lyric) {
      --lyrics-color-passed: ${data.colors.passed};
    }

    main > div > div:nth-child(1) {
      --lyrics-color-background: ${data.colors.background};
    }

    main div:has(${LYRIC}) {
      --lyrics-color-active: ${data.colors.active};
      --lyrics-color-inactive: ${data.colors.inactive};
      --lyrics-color-romanization: ${data.colors.romanization};
      --lyrics-color-translation: ${data.colors.translation};
    }
    ${!colorsEnabled ? '*/' : ''}

    /** TODO: full screen styling? */
    .npv-lyrics__content--full-screen {
      height: 70vh !important;
    }
  `.trim();

  style.innerHTML = css
}
