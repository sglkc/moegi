import {
  FULLSCREEN_BUTTON,
  FULLSCREEN_LYRIC,
  LYRIC_SELECTOR,
  ORIGINAL_LYRIC,
  ROMANIZED_LYRIC,
  TRANSLATED_LYRIC,
} from '@/utils/constants'
import { debounce } from '@/utils/debounce'
import { updateAutoScrollMode } from './auto-scroll'

let fullscreenObserver: MutationObserver | null = null
let lyricsChangeObserver: MutationObserver | null = null
let isSetup = false

export default function lyricsFullscreen() {
  if (isSetup) return
  
  setupFullscreenSync()
  isSetup = true
}

function setupFullscreenSync() {
  const debouncedSyncLyrics = debounce(updateFullscreenLyrics, 500)

  // Setup fullscreen button observer
  fullscreenObserver = new MutationObserver(() => {
    const fullscreenButton = document.querySelector(FULLSCREEN_BUTTON)
    if (fullscreenButton && !fullscreenButton.hasAttribute('moegi-listener')) {
      fullscreenButton.setAttribute('moegi-listener', 'true')
      fullscreenButton.addEventListener('click', () => {
        // Delay sync to allow UI transition
        setTimeout(() => {
          debouncedSyncLyrics()
          updateAutoScrollMode() // Update auto-scroll for new mode
        }, 100)
      })
    }
  })

  // Start observing for fullscreen button
  fullscreenObserver.observe(document.body, { 
    childList: true, 
    subtree: true 
  })

  // Attach listener if button already exists
  const existingButton = document.querySelector(FULLSCREEN_BUTTON)
  if (existingButton && !existingButton.hasAttribute('moegi-listener')) {
    existingButton.setAttribute('moegi-listener', 'true')
    existingButton.addEventListener('click', () => {
      setTimeout(() => {
        debouncedSyncLyrics()
        updateAutoScrollMode() // Update auto-scroll for new mode
      }, 100)
    })
  }

  // Setup lyrics change observer
  setupLyricsChangeObserver(debouncedSyncLyrics)
}

function setupLyricsChangeObserver(syncCallback: () => void) {
  lyricsChangeObserver = new MutationObserver((mutations) => {
    let shouldSync = false
    
    for (const mutation of mutations) {
      if (mutation.type === 'childList' || mutation.type === 'characterData') {
        // Check if the mutation is related to lyrics
        const target = mutation.target as Element
        if (target.closest(LYRIC_SELECTOR) || target.matches(LYRIC_SELECTOR)) {
          shouldSync = true
          break
        }
      }
    }
    
    if (shouldSync) {
      syncCallback()
    }
  })

  // Observe lyrics container for changes
  const observeLyricsElements = () => {
    const lyricElements = document.querySelectorAll(LYRIC_SELECTOR)
    lyricElements.forEach((element) => {
      lyricsChangeObserver!.observe(element, {
        childList: true,
        subtree: true,
        characterData: true
      })
    })
  }

  // Initial setup
  observeLyricsElements()

  // Re-observe when new lyrics are added
  const lyricsContainerObserver = new MutationObserver(() => {
    observeLyricsElements()
  })

  lyricsContainerObserver.observe(document.body, {
    childList: true,
    subtree: true
  })
}

async function updateFullscreenLyrics() {
  const nonFullscreenLyrics = document.querySelectorAll(LYRIC_SELECTOR)
  const fullscreenLyrics = document.querySelectorAll(FULLSCREEN_LYRIC)

  if (!nonFullscreenLyrics.length || !fullscreenLyrics.length) {
    return
  }

  const processedLyrics = extractLyricsData(nonFullscreenLyrics)
  syncToFullscreen(processedLyrics, fullscreenLyrics)
}

function extractLyricsData(lyricElements: NodeListOf<Element>) {
  const lyricsData: Array<{
    original: string
    romanized: string
    translated: string
  }> = []

  lyricElements.forEach((element) => {
    const originalText = element.querySelector(`.${ORIGINAL_LYRIC}`)?.textContent?.trim() || ''
    const romanizedText = element.querySelector(`.${ROMANIZED_LYRIC}`)?.textContent?.trim() || ''
    const translatedText = element.querySelector(`.${TRANSLATED_LYRIC}`)?.textContent?.trim() || ''

    // Only include lyrics with content
    if (originalText) {
      lyricsData.push({
        original: originalText,
        romanized: romanizedText,
        translated: translatedText
      })
    }
  })

  return lyricsData
}

function syncToFullscreen(
  lyricsData: Array<{ original: string; romanized: string; translated: string }>,
  fullscreenElements: NodeListOf<Element>
) {
  lyricsData.forEach((lyricData, index) => {
    const fullscreenElement = fullscreenElements[index + 2] // Adjust index to account for empty lyrics
    
    if (!fullscreenElement) return

    // Clear existing content
    fullscreenElement.textContent = lyricData.original

    // Add romanization if available
    if (lyricData.romanized) {
      const romanizedP = document.createElement('p')
      romanizedP.className = ROMANIZED_LYRIC
      romanizedP.textContent = lyricData.romanized
      fullscreenElement.appendChild(romanizedP)
    }

    // Add translation if available
    if (lyricData.translated) {
      const translatedP = document.createElement('p')
      translatedP.className = TRANSLATED_LYRIC
      translatedP.textContent = lyricData.translated
      fullscreenElement.appendChild(translatedP)
    }
  })
}

// Cleanup function for when the content script is destroyed
export function cleanupFullscreen() {
  if (fullscreenObserver) {
    fullscreenObserver.disconnect()
    fullscreenObserver = null
  }
  
  if (lyricsChangeObserver) {
    lyricsChangeObserver.disconnect()
    lyricsChangeObserver = null
  }
  
  // Remove event listeners
  const buttons = document.querySelectorAll(`${FULLSCREEN_BUTTON}[moegi-listener]`)
  buttons.forEach(button => button.removeAttribute('moegi-listener'))
  
  isSetup = false
}
