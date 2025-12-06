import { LYRIC_SELECTOR } from "@/utils/constants"

const orphanStorage = new Map<string, string>()
let observer: MutationObserver | undefined

/**
 * Observes lyrics container for any changes in lyrics element
 *
 * - Restore custom elements on changes
 *   @see {@link https://github.com/sglkc/moegi/issues/29#issuecomment-3546748205|GitHub}
 */
export default function lyricsObserver(container: HTMLElement) {
  console.log('observer, contaner', observer, container)
  if (observer) {
    observer.disconnect()
    orphanStorage.clear()
  }

  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {

      // Save deleted lyrics HTML, use original lyrics as key
      if (mutation.removedNodes.length > 0) {
        mutation.removedNodes.forEach((node) => {
          if (node instanceof HTMLElement && node.matches(LYRIC_SELECTOR)) {
            console.log('saved', node.firstElementChild?.textContent, node.innerHTML)
            const id = node.firstElementChild?.textContent?.trim()
            if (!id) return
            orphanStorage.set(id, node.innerHTML)
          }
        })
      }

      // Restore deleted lyrics HTML
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement && node.matches(LYRIC_SELECTOR)) {
            console.log('restoered', node.firstElementChild?.textContent)
            const id = node.textContent?.trim()
            if (!id) return

            const savedHTML = orphanStorage.get(id)
            orphanStorage.delete(id)
            if (!savedHTML) return
            node.innerHTML = savedHTML
          }
        })
      }
    }
  })

  observer.observe(container, { childList: true, subtree: true })
}
