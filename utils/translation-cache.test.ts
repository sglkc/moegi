import { describe, expect, it } from 'vitest'
import {
  setTranslationCacheEntry,
  splitTranslationLines,
  translationCacheKey,
} from './translation-cache'

describe('translationCacheKey', () => {
  it('includes title and language', () => {
    expect(translationCacheKey('Song', 'en')).toBe('Song\0en')
    expect(translationCacheKey('Song', 'en')).not.toBe(translationCacheKey('Song', 'ja'))
  })
})

describe('setTranslationCacheEntry', () => {
  it('evicts oldest entries when over limit', () => {
    let cache: Record<string, string> = {}
    cache = setTranslationCacheEntry(cache, 'a', '1', 2)
    cache = setTranslationCacheEntry(cache, 'b', '2', 2)
    cache = setTranslationCacheEntry(cache, 'c', '3', 2)

    expect(cache).toEqual({ b: '2', c: '3' })
    expect(cache.a).toBeUndefined()
  })

  it('refreshes recency on update', () => {
    let cache: Record<string, string> = {}
    cache = setTranslationCacheEntry(cache, 'a', '1', 2)
    cache = setTranslationCacheEntry(cache, 'b', '2', 2)
    cache = setTranslationCacheEntry(cache, 'a', '1-updated', 2)
    cache = setTranslationCacheEntry(cache, 'c', '3', 2)

    expect(cache).toEqual({ a: '1-updated', c: '3' })
  })
})

describe('splitTranslationLines', () => {
  it('accepts matching line counts', () => {
    expect(splitTranslationLines('a\nb\nc', 3)).toEqual(['a', 'b', 'c'])
  })

  it('rejects mismatched line counts', () => {
    expect(splitTranslationLines('a\nb', 3)).toBeNull()
    expect(splitTranslationLines('a\nb\nc', 2)).toBeNull()
    expect(splitTranslationLines('hello', 0)).toBeNull()
  })
})
