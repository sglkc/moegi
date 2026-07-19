import { beforeEach, describe, expect, it, vi } from 'vitest'
import { applyOptionChanges } from './apply-options'
import { createProcessedLyrics } from './test-fixtures'
import { moegiDefaultOptions, MoegiOptions } from '@/utils/options'

describe('applyOptionChanges (options fan-out flow)', () => {
  const styling = vi.fn()
  const romanization = vi.fn(async () => {})
  const translation = vi.fn(async () => {})

  let lyrics: HTMLDivElement[]
  let options: MoegiOptions

  beforeEach(() => {
    document.body.innerHTML = ''
    styling.mockClear()
    romanization.mockClear()
    translation.mockClear()
    lyrics = createProcessedLyrics(['hello', 'world'])
    options = structuredClone(moegiDefaultOptions)
  })

  const deps = () => ({ styling, romanization, translation })

  it('runs only styling for font/color related changes', () => {
    applyOptionChanges(['fonts', 'fonts.size'], options, lyrics, deps())

    expect(styling).toHaveBeenCalledOnce()
    expect(styling).toHaveBeenCalledWith(options)
    expect(romanization).not.toHaveBeenCalled()
    expect(translation).not.toHaveBeenCalled()
  })

  it('runs romanization for romanization.* changes (and styling for enabled/size)', () => {
    // romanization.enabled is also a styling dependency (hide-original coupling)
    applyOptionChanges(['romanization.enabled'], options, lyrics, deps())

    expect(romanization).toHaveBeenCalledOnce()
    expect(romanization).toHaveBeenCalledWith(lyrics, options.romanization)
    expect(styling).toHaveBeenCalledOnce()
    expect(translation).not.toHaveBeenCalled()
  })

  it('runs romanization only for nested japanese options without styling', () => {
    applyOptionChanges(['romanization.japanese'], options, lyrics, deps())

    expect(romanization).toHaveBeenCalledOnce()
    expect(styling).not.toHaveBeenCalled()
    expect(translation).not.toHaveBeenCalled()
  })

  it('runs translation for translation target/enabled changes', () => {
    applyOptionChanges(['translation.target'], options, lyrics, deps())

    expect(translation).toHaveBeenCalledOnce()
    expect(translation).toHaveBeenCalledWith(lyrics, options.translation)
    expect(styling).not.toHaveBeenCalled()
    expect(romanization).not.toHaveBeenCalled()
  })

  it('runs styling when translation.enabled changes (size/visibility coupling)', () => {
    applyOptionChanges(['translation.enabled'], options, lyrics, deps())

    expect(styling).toHaveBeenCalledOnce()
    expect(translation).toHaveBeenCalledOnce()
  })

  it('can fan out to all three when multiple change keys arrive', () => {
    applyOptionChanges(
      ['fonts', 'romanization.japanese', 'translation.target'],
      options,
      lyrics,
      deps(),
    )

    expect(styling).toHaveBeenCalledOnce()
    expect(romanization).toHaveBeenCalledOnce()
    expect(translation).toHaveBeenCalledOnce()
  })

  it('does nothing for empty change list', () => {
    applyOptionChanges([], options, lyrics, deps())

    expect(styling).not.toHaveBeenCalled()
    expect(romanization).not.toHaveBeenCalled()
    expect(translation).not.toHaveBeenCalled()
  })
})
