import { beforeEach, describe, expect, it, vi } from 'vitest'

// Avoid pulling WXT `#imports` via utils/storage when loading init defaults
vi.mock('@/utils/storage', () => ({
  optionsStorage: {
    getValue: vi.fn(async () => ({})),
  },
}))

vi.mock('@/utils/messaging', () => ({
  Content: {
    sendMessage: vi.fn(),
    onMessage: vi.fn(),
  },
  Background: {
    sendMessage: vi.fn(),
    onMessage: vi.fn(),
  },
}))

vi.mock('./observer', () => ({
  default: vi.fn(),
}))

import lyricsInit, { LyricsInitDeps } from './init'
import { processLyricElement } from './process-lyric'
import { createRawLyricLine } from './test-fixtures'
import {
  ORIGINAL_LYRIC,
  ROMANIZED_LYRIC,
  TRANSLATED_LYRIC,
} from '@/utils/constants'
import { moegiDefaultOptions } from '@/utils/options'

describe('lyricsInit (lyrics open orchestration)', () => {
  const clearCache = vi.fn()
  const processLine = vi.fn((el: HTMLElement) => processLyricElement(el))
  const observe = vi.fn()
  const styling = vi.fn()
  const romanization = vi.fn(async () => {})
  const translation = vi.fn(async () => {})
  const getOptions = vi.fn(async () => structuredClone(moegiDefaultOptions))
  const createToast = vi.fn(async () => 42)
  const destroyToast = vi.fn(async () => true)
  const autoScroll = vi.fn()

  const deps = (): LyricsInitDeps => ({
    clearCache,
    processLine,
    observe,
    styling,
    romanization,
    translation,
    getOptions,
    createToast,
    destroyToast,
    autoScroll,
  })

  beforeEach(() => {
    document.body.innerHTML = ''
    clearCache.mockClear()
    processLine.mockClear()
    observe.mockClear()
    styling.mockClear()
    romanization.mockClear()
    translation.mockClear()
    getOptions.mockClear()
    createToast.mockClear()
    destroyToast.mockClear()
    autoScroll.mockClear()
  })

  function mountContainer(texts: string[]): HTMLDivElement {
    const container = document.createElement('div')
    for (const text of texts) {
      container.appendChild(createRawLyricLine(text))
    }
    // Empty Spotify-style blank line should be ignored by :has(> :not(:empty))
    container.appendChild(createRawLyricLine(''))
    document.body.appendChild(container)
    return container
  }

  it('no-ops when there are no non-empty lyric lines', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    await lyricsInit(container, deps())

    expect(clearCache).toHaveBeenCalledOnce()
    expect(processLine).not.toHaveBeenCalled()
    expect(createToast).not.toHaveBeenCalled()
    expect(styling).not.toHaveBeenCalled()
  })

  it('processes lines, toasts, and applies options end-to-end', async () => {
    const container = mountContainer(['line one', 'line two'])
    const options = structuredClone(moegiDefaultOptions)
    options.romanization.enabled = true
    getOptions.mockResolvedValue(options)

    await lyricsInit(container, deps())

    expect(clearCache).toHaveBeenCalledOnce()
    expect(processLine).toHaveBeenCalledTimes(2)
    expect(createToast).toHaveBeenCalledWith({ text: 'Processing lyrics...' })
    expect(destroyToast).toHaveBeenCalledWith(42)
    expect(createToast).toHaveBeenCalledWith({
      text: 'Found 2 lyric lines!',
      duration: 1000,
    })

    const lines = container.querySelectorAll('[data-testid="lyrics-line"]')
    const first = lines[0] as HTMLElement
    expect(first.querySelector(`.${ORIGINAL_LYRIC}`)?.textContent).toBe('line one')
    expect(first.querySelector(`.${ROMANIZED_LYRIC}`)).toBeTruthy()
    expect(first.querySelector(`.${TRANSLATED_LYRIC}`)).toBeTruthy()

    expect(observe).toHaveBeenCalledWith(container)
    expect(styling).toHaveBeenCalledWith(options)
    expect(autoScroll).toHaveBeenCalledWith(container, options.fonts.autoScroll)
    expect(romanization).toHaveBeenCalledOnce()
    expect(translation).toHaveBeenCalledOnce()
  })

  it('passes fonts.autoScroll=false through to autoScroll', async () => {
    const container = mountContainer(['line'])
    const options = structuredClone(moegiDefaultOptions)
    options.fonts.autoScroll = false
    getOptions.mockResolvedValue(options)

    await lyricsInit(container, deps())

    expect(autoScroll).toHaveBeenCalledWith(container, false)
  })
})
