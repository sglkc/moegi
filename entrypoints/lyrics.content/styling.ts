export default function lyricsStyling() {
  const {
    LYRIC_SELECTOR: LYRIC,
    ORIGINAL_LYRIC: ORIGINAL,
    TRANSLATED_LYRIC: TRANSLATED,
    ROMANIZED_LYRIC: ROMANIZED,
  } = constants

  function applyStyling(data: MoegiOptions): void {
    let style = document.querySelector<HTMLStyleElement>('#moegi-style')

    if (!style) {
      style = document.createElement('style')
      style.id = 'moegi-style'
      document.head.appendChild(style)
    }

    const colorsEnabled = data.colors.enabled

    const hideOriginal =
      (data.translation || data.romanization) && data.fonts.hideOriginal;

    const css = `
      .${ORIGINAL}:has(~ :is(.${ROMANIZED}, .${TRANSLATED}):not(:empty)) {
        display: ${hideOriginal ? 'none' : 'inherit'};
      }

      .${ROMANIZED} {
        font-size: ${data.romanization.size}em;
        color: var(--lyrics-color-romanization);
      }

      .${TRANSLATED} {
        font-size: ${data.translation.size}em;
        color: var(--lyrics-color-translation);
      }

      ${!colorsEnabled ? '/*' : ''}
      ${document.querySelector(LYRIC)!.parentElement?.className} {
        ${ Object.entries(data.colors).map(([ k, v ]) => k === 'enabled' ? '' : `
        --lyrics-color-${k}: ${v}!important;`
        ).join('')}
      }

      ${LYRIC} {
        margin-top: ${data.fonts.spacing}px;
        font-size: ${data.fonts.size}em;
        text-align: ${data.fonts.align};
        line-height: 1.5;
      }
      ${!colorsEnabled ? '*/' : ''}

      /** TODO: full screen styling? */
      .npv-lyrics__content--full-screen {
        height: 70vh !important;
      }
    `.trim();

    style.innerHTML = css

    // Color variables exist in lyrics container, cant prioritize from root
    const container = document.querySelector<HTMLDivElement>(LYRIC)!.parentElement!
    const colorKeys = [
      'translation',
      'romanization',
      'active',
      'inactive',
      'passed',
      'background',
    ] as const

    for (const key of colorKeys) {
      const prop = `--lyrics-color-${key}`

      if (data.colors[key])
        container.style.setProperty(prop, data.colors[key])
      else
        container.style.removeProperty(prop)
    }
  }

  Background.onMessage('applyOptions', ({ data }) => applyStyling(data))
}
