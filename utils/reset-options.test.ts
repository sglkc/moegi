import { describe, expect, it, vi } from 'vitest'
import { moegiDefaultOptions, type MoegiOptions } from './options'
import { resetOptionsToDefaults } from './reset-options'

describe('resetOptionsToDefaults (options reset flow)', () => {
  it('restores factory defaults onto a mutated options object', async () => {
    const target = structuredClone(moegiDefaultOptions) as MoegiOptions
    target.fonts.enabled = true
    target.fonts.size = 2.5
    target.translation.enabled = true
    target.translation.target = 'ja'
    target.romanization.enabled = true
    target.colors.active = '#ff0000'

    const setValue = vi.fn(async () => {})

    const result = await resetOptionsToDefaults(target, { setValue })

    expect(target).toEqual(moegiDefaultOptions)
    expect(result).toEqual(moegiDefaultOptions)
    expect(setValue).toHaveBeenCalledOnce()
    expect(setValue).toHaveBeenCalledWith(moegiDefaultOptions)
  })

  it('persists a deep clone so later mutations do not alias storage writes', async () => {
    const target = structuredClone(moegiDefaultOptions) as MoegiOptions
    target.fonts.size = 9

    let persisted: MoegiOptions | undefined
    await resetOptionsToDefaults(target, {
      setValue: async (value) => {
        persisted = value
      },
    })

    target.fonts.size = 99
    expect(persisted?.fonts.size).toBe(moegiDefaultOptions.fonts.size)
    expect(persisted?.fonts.size).not.toBe(99)
  })
})
