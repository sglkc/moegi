import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { debounce } from './debounce'

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('delays invocation until quiet period elapses', () => {
    const fn = vi.fn()
    const d = debounce(fn, 100)

    d('a')
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(99)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledOnce()
    expect(fn).toHaveBeenCalledWith('a')
  })

  it('resets the timer on subsequent calls and keeps last args', () => {
    const fn = vi.fn()
    const d = debounce(fn, 100)

    d(1)
    vi.advanceTimersByTime(50)
    d(2)
    vi.advanceTimersByTime(50)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(50)
    expect(fn).toHaveBeenCalledOnce()
    expect(fn).toHaveBeenCalledWith(2)
  })
})
