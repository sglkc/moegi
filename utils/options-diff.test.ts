import { describe, expect, it } from 'vitest'
import { moegiDefaultOptions } from './options'
import { diffOptionChanges, FULL_OPTION_CHANGE_KEYS } from './options-diff'

describe('diffOptionChanges', () => {
  it('returns full change keys when there is no previous baseline', () => {
    const next = structuredClone(moegiDefaultOptions)
    const keys = diffOptionChanges(undefined, next)
    expect(keys).toEqual(FULL_OPTION_CHANGE_KEYS)
    expect(keys).toContain('fonts')
    expect(keys).toContain('romanization.enabled')
  })

  it('returns empty when options are identical', () => {
    const a = structuredClone(moegiDefaultOptions)
    const b = structuredClone(moegiDefaultOptions)
    expect(diffOptionChanges(a, b)).toEqual([])
  })

  it('detects nested font size changes', () => {
    const prev = structuredClone(moegiDefaultOptions)
    const next = structuredClone(moegiDefaultOptions)
    next.fonts.size = 1.5
    const keys = diffOptionChanges(prev, next)
    expect(keys).toContain('fonts')
    expect(keys).toContain('fonts.size')
  })

  it('detects enabling romanization', () => {
    const prev = structuredClone(moegiDefaultOptions)
    const next = structuredClone(moegiDefaultOptions)
    next.romanization.enabled = true
    const keys = diffOptionChanges(prev, next)
    expect(keys).toContain('romanization.enabled')
  })
})
