import { beforeEach, describe, expect, it } from 'vitest'
import lyricsStyling from './styling'
import { optionsWith } from './test-fixtures'

describe('lyricsStyling (injected CSS feature)', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
  })

  it('creates a #moegi-style element with font rules when fonts are enabled', () => {
    lyricsStyling(optionsWith({
      fonts: { enabled: true, size: 1.5, spacing: 12, align: 'center' },
    }))

    const style = document.querySelector<HTMLStyleElement>('#moegi-style')
    expect(style).toBeTruthy()
    expect(style?.textContent).toContain('font-size: 1.5em')
    expect(style?.textContent).toContain('margin-top: 12px')
    expect(style?.textContent).toContain('text-align: center')
  })

  it('comments out font block when fonts are disabled', () => {
    lyricsStyling(optionsWith({
      fonts: { enabled: false, size: 2 },
    }))

    const css = document.querySelector('#moegi-style')?.textContent ?? ''
    // Font size sits inside a /* ... */ block when disabled
    const fontsDisabled = css.includes('/*') && css.includes('font-size: 2em')
    expect(fontsDisabled).toBe(true)
  })

  it('sanitizes malicious color values before injection', () => {
    lyricsStyling(optionsWith({
      colors: {
        enabled: true,
        active: 'red; } body { display:none',
        background: '#ff00aa',
      },
    }))

    const css = document.querySelector('#moegi-style')?.textContent ?? ''
    expect(css).toContain('--lyrics-color-background: #ff00aa')
    expect(css).toContain('--lyrics-color-active: inherit')
    expect(css).not.toContain('display:none')
  })

  it('updates the same style element on subsequent calls', () => {
    lyricsStyling(optionsWith({ fonts: { enabled: true, size: 1 } }))
    lyricsStyling(optionsWith({ fonts: { enabled: true, size: 2 } }))

    expect(document.querySelectorAll('#moegi-style')).toHaveLength(1)
    expect(document.querySelector('#moegi-style')?.textContent).toContain('font-size: 2em')
  })
})
