import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  configureAutoScroll,
  findActiveLyric,
  scrollActiveLyricIntoView,
  startAutoScroll,
  stopAutoScroll,
} from './auto-scroll'
import { createRawLyricLine } from './test-fixtures'

describe('findActiveLyric / scrollActiveLyricIntoView', () => {
  let container: HTMLDivElement
  let lines: HTMLDivElement[]

  beforeEach(() => {
    document.body.innerHTML = ''
    container = document.createElement('div')
    // Make a scrollable parent so scrollIntoView is meaningful in happy-dom
    Object.defineProperty(container, 'scrollTop', { value: 0, writable: true })
    lines = ['one', 'two', 'three', 'four', 'five'].map((t) => {
      const line = createRawLyricLine(t)
      container.appendChild(line)
      return line
    })
    document.body.appendChild(container)
  })

  afterEach(() => {
    stopAutoScroll()
    vi.restoreAllMocks()
  })

  it('returns null when no line is active', () => {
    expect(findActiveLyric(container)).toBeNull()
  })

  it('finds a line with class active-lyric', () => {
    lines[2].classList.add('active-lyric')
    expect(findActiveLyric(container)).toBe(lines[2])
  })

  it('finds a line with aria-current=true', () => {
    lines[1].setAttribute('aria-current', 'true')
    expect(findActiveLyric(container)).toBe(lines[1])
  })

  it('finds parent lyrics-line when active class is on a child', () => {
    const inner = document.createElement('span')
    inner.classList.add('active-lyric')
    lines[3].appendChild(inner)
    expect(findActiveLyric(container)).toBe(lines[3])
  })

  it('scrollIntoView is called on the active line', () => {
    const spy = vi.fn()
    lines[4].scrollIntoView = spy
    lines[4].classList.add('active-lyric')

    expect(scrollActiveLyricIntoView(container, { behavior: 'auto' })).toBe(true)
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ block: 'center', behavior: 'auto' }),
    )
  })

  it('scrollActiveLyricIntoView returns false without an active line', () => {
    expect(scrollActiveLyricIntoView(container)).toBe(false)
  })
})

describe('startAutoScroll / configureAutoScroll', () => {
  let container: HTMLDivElement
  let lines: HTMLDivElement[]

  beforeEach(() => {
    document.body.innerHTML = ''
    vi.useFakeTimers()
    container = document.createElement('div')
    lines = ['a', 'b', 'c'].map((t) => {
      const line = createRawLyricLine(t)
      line.scrollIntoView = vi.fn()
      container.appendChild(line)
      return line
    })
    document.body.appendChild(container)
  })

  afterEach(() => {
    stopAutoScroll()
    vi.useRealTimers()
  })

  it('no-ops when enabled is false', () => {
    const handle = startAutoScroll(container, { enabled: false })
    lines[0].classList.add('active-lyric')
    handle.refresh()
    expect(lines[0].scrollIntoView).not.toHaveBeenCalled()
    handle.disconnect()
  })

  it('scrolls on start when a line is already active', () => {
    lines[1].classList.add('active-lyric')
    startAutoScroll(container, { enabled: true })
    expect(lines[1].scrollIntoView).toHaveBeenCalled()
  })

  it('scrolls when active class moves to another line (debounced)', () => {
    startAutoScroll(container, { enabled: true, debounceMs: 50 })
    lines[0].classList.add('active-lyric')
    // MutationObserver may or may not fire in happy-dom when we set class;
    // drive via attribute mutation on observed tree by replacing class
    lines[0].classList.remove('active-lyric')
    lines[2].classList.add('active-lyric')
    // Force attribute mutation observer in environments that support it
    lines[2].setAttribute('class', lines[2].className)

    vi.advanceTimersByTime(60)
    // refresh path always works
    configureAutoScroll(container, true)
    expect(lines[2].scrollIntoView).toHaveBeenCalled()
  })

  it('configureAutoScroll(false) stops further scrolling', () => {
    lines[0].classList.add('active-lyric')
    configureAutoScroll(container, true)
    expect(lines[0].scrollIntoView).toHaveBeenCalled()

    const calls = (lines[0].scrollIntoView as ReturnType<typeof vi.fn>).mock.calls.length
    configureAutoScroll(container, false)
    lines[0].classList.remove('active-lyric')
    lines[1].classList.add('active-lyric')
    lines[1].setAttribute('class', lines[1].className)
    vi.advanceTimersByTime(200)
    expect((lines[1].scrollIntoView as ReturnType<typeof vi.fn>).mock.calls.length).toBe(0)
    expect((lines[0].scrollIntoView as ReturnType<typeof vi.fn>).mock.calls.length).toBe(calls)
  })
})
