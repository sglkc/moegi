import { describe, expect, it } from 'vitest'
import { createArrayHas, getDeepKeys } from './deep-keys'

describe('getDeepKeys', () => {
  it('returns nested keys in dot notation', () => {
    const keys = getDeepKeys({
      fonts: { enabled: true, size: 1 },
      translation: { target: 'en' },
    })

    expect(keys).toEqual(expect.arrayContaining([
      'fonts',
      'fonts.enabled',
      'fonts.size',
      'translation',
      'translation.target',
    ]))
  })
})

describe('createArrayHas', () => {
  it('reports whether any requested key is present', () => {
    const has = createArrayHas(['fonts', 'translation.target'])
    expect(has('fonts')).toBe(true)
    expect(has('colors', 'translation.target')).toBe(true)
    expect(has('colors', 'romanization')).toBe(false)
  })
})
