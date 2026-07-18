import { describe, expect, it } from 'vitest'
import { safeCssColor, safeCssNumber, safeTextAlign } from './css-safe'

describe('safeCssColor', () => {
  it('allows hex colors', () => {
    expect(safeCssColor('#fff')).toBe('#fff')
    expect(safeCssColor('#aabbcc')).toBe('#aabbcc')
    expect(safeCssColor('#aabbccdd')).toBe('#aabbccdd')
  })

  it('allows rgb/hsl and keywords', () => {
    expect(safeCssColor('rgb(1, 2, 3)')).toBe('rgb(1, 2, 3)')
    expect(safeCssColor('rgba(1, 2, 3, 0.5)')).toBe('rgba(1, 2, 3, 0.5)')
    expect(safeCssColor('hsl(120, 50%, 50%)')).toBe('hsl(120, 50%, 50%)')
    expect(safeCssColor('inherit')).toBe('inherit')
    expect(safeCssColor('transparent')).toBe('transparent')
  })

  it('rejects CSS breakout attempts and empty values', () => {
    expect(safeCssColor('red; } body { display:none')).toBe('inherit')
    expect(safeCssColor('url(javascript:alert(1))')).toBe('inherit')
    expect(safeCssColor('')).toBe('inherit')
    expect(safeCssColor(null, 'transparent')).toBe('transparent')
  })
})

describe('safeTextAlign', () => {
  it('allows known aligns only', () => {
    expect(safeTextAlign('center')).toBe('center')
    expect(safeTextAlign('justify')).toBe('left')
    expect(safeTextAlign('left; color:red')).toBe('left')
  })
})

describe('safeCssNumber', () => {
  it('returns finite numbers only', () => {
    expect(safeCssNumber(1.25)).toBe(1.25)
    expect(safeCssNumber(Number.NaN, 3)).toBe(3)
    expect(safeCssNumber(Infinity, 0)).toBe(0)
    expect(safeCssNumber(undefined, 2)).toBe(2)
  })
})
