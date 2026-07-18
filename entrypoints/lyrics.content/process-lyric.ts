import {
  ORIGINAL_LYRIC,
  ROMANIZED_LYRIC,
  TRANSLATED_LYRIC,
} from '@/utils/constants'

/**
 * Normalize a raw lyric line element into original / romanized / translated slots.
 */
export function processLyricElement(element: HTMLElement): void {
  // Clear previous lyrics if already initialized, then restart the process
  if (element.children.length > 1) {
    element.innerHTML = element.children[0].innerHTML
  }

  const originalLyric = element.textContent?.trim()

  if (!originalLyric) return

  const originalElement = document.createElement('p')
  originalElement.className = ORIGINAL_LYRIC
  originalElement.textContent = originalLyric

  const romanizedElement = document.createElement('p')
  romanizedElement.className = ROMANIZED_LYRIC

  const translatedElement = document.createElement('p')
  translatedElement.className = TRANSLATED_LYRIC

  element.replaceChildren(
    originalElement,
    romanizedElement,
    translatedElement,
  )
}
