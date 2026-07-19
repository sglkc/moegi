import { describe, expect, it } from 'vitest'
import { mergeStoredOptions } from './merge-options'
import { moegiDefaultOptions } from './options'

describe('mergeStoredOptions', () => {
  it('merges nested fields without dropping new defaults', () => {
    const target = structuredClone(moegiDefaultOptions)
    mergeStoredOptions(target, {
      fonts: { size: 2, enabled: true },
    } as any)

    expect(target.fonts.size).toBe(2)
    expect(target.fonts.enabled).toBe(true)
    // Unspecified nested keys keep target defaults
    expect(target.fonts.autoScroll).toBe(true)
    expect(target.fonts.align).toBe('left')
  })

  it('no-ops on null/undefined stored', () => {
    const target = structuredClone(moegiDefaultOptions)
    mergeStoredOptions(target, null)
    mergeStoredOptions(target, undefined)
    expect(target).toEqual(moegiDefaultOptions)
  })
})
